import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'utils/db';

import { apiError, APIGetRequest, apiResponse } from 'utils/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export type GetUserSearchRequest = APIGetRequest<{
  user: {
    email: string | null;
    id: string;
    image: string | null;
    name: string | null;
  } | null;
}>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return apiError(res, { message: 'Not authenticated' }, 401);
  }

  const searchString = req.query.searchString as string | undefined;

  if (req.method === 'GET') {
    const user = await prisma.user.findFirst({
      where: {
        email: searchString,
      },
      select: {
        id: true,
        image: true,
        email: true,
        name: true,
      },
    });

    return apiResponse<GetUserSearchRequest>(res, {
      user,
    });
  }

  return apiError(res, { message: 'Method not supported' }, 405);
};

export default handler;
