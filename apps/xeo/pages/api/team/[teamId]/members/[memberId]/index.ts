import { NextApiRequest, NextApiResponse } from 'next';
import {
  APIDeleteRequest,
  apiError,
  APIRequest,
  apiResponse,
  parseAPIRequest,
} from 'utils/api';
import { prisma } from 'utils/db';

import Joi from 'joi';
import { TeamRole } from '@prisma/client';
import { getUserRoleInTeam } from 'utils/db/team/adapter';
import { getServerSession } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';

export type DeleteTeamMember = APIDeleteRequest<{
  message: string;
}>;

export type UpdateTeamMember = APIRequest<
  { role: TeamRole },
  { message: string }
>;

const putSchema: UpdateTeamMember['joiBodySchema'] = Joi.object({
  role: Joi.string()
    .valid(...Object.values(TeamRole))
    .required(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const callingUserId = session.id as string;
  const teamId = req.query.teamId as string;
  const memberId = req.query.memberId as string;

  if (!teamId || !memberId) {
    return apiError(res, { message: 'Missing required query parameters' });
  }

  const callingUserRole = await getUserRoleInTeam(callingUserId, teamId);

  if (!callingUserRole) {
    return apiError(res, { message: 'User is not a member of the team' });
  }

  switch (req.method) {
    case 'PUT':
      return putHandler(req, res, teamId, memberId, callingUserRole);
    case 'DELETE':
      return deleteHandler(
        req,
        res,
        teamId,
        memberId,
        callingUserRole,
        callingUserId
      );
  }

  return apiError(res, { message: 'Invalid method' }, 400);
};

const putHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  teamId: string,
  memberId: string,
  callingUserRole: TeamRole
) => {
  const { body, error } = parseAPIRequest(req, putSchema);

  if (error) {
    return apiError(res, error);
  }

  if (callingUserRole === TeamRole.MEMBER) {
    return apiError(
      res,
      { message: 'You dont have permission to add backlog members' },
      400
    );
  }

  const memberToUpdate = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: memberId,
        teamId,
      },
    },
  });

  if (!memberToUpdate) {
    return apiError(res, { message: 'Member not found' }, 404);
  }

  // if member to update is owner, cannot change role
  if (memberToUpdate.role === TeamRole.OWNER) {
    return apiError(res, { message: 'Cannot change owner role' }, 400);
  }

  // disallow updating role to owner if not owner
  if (body.role === TeamRole.OWNER) {
    return apiError(
      res,
      {
        message:
          'Cannot change owner role, to transfer ownership contact support',
      },
      400
    );
  }

  await prisma.teamMember.update({
    where: {
      userId_teamId: {
        userId: memberId,
        teamId,
      },
    },
    data: {
      role: body.role,
    },
  });

  return apiResponse<UpdateTeamMember>(res, {
    message: `Updated Member`,
  });
};

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  teamId: string,
  memberId: string,
  callingUserRole: TeamRole,
  callingUserId: string
) => {
  // Member can only delete themselves
  if (callingUserRole === TeamRole.MEMBER && callingUserId !== memberId) {
    return apiError(
      res,
      { message: 'You dont have permission to remove others from this team' },
      400
    );
  }

  const memberToDelete = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: memberId,
        teamId,
      },
    },
  });

  if (!memberToDelete) {
    return apiError(res, { message: 'Member not found' }, 404);
  }

  if (memberToDelete.role === TeamRole.OWNER) {
    return apiError(res, { message: 'Owner cannot be removed' }, 400);
  }

  await prisma.teamMember.delete({
    where: {
      userId_teamId: {
        userId: memberId,
        teamId,
      },
    },
  });

  return apiResponse<DeleteTeamMember>(res, {
    message: `Deleted Member`,
  });
};

export default handler;
