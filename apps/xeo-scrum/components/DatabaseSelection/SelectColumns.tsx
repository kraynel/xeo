import { NotionColumnType } from '@prisma/client';
import { SelectField } from '@xeo/ui';
import { UseFormReturn } from 'react-hook-form';
import {
  DatabasePropertyOption,
  DatabaseSelectionForm,
  DatabaseSprintFieldType,
} from './useDatabaseSelection';

interface Props {
  form: UseFormReturn<DatabaseSelectionForm>;
}
export const SelectColumns: React.FunctionComponent<Props> = ({
  form: { control, watch },
}) => {
  const currentDatabaseSelected = watch('database');
  const currentSprintSelectType = watch('sprintSelectType');

  const availableDatabaseProperties = currentDatabaseSelected
    ? Object.values(currentDatabaseSelected.properties)
    : [];

  const propertiesOptions: DatabasePropertyOption[] =
    availableDatabaseProperties.map((property) => ({
      label: property.name,
      value: property.id,
      type: property.type,
    }));

  const sprintSelectTypeOptions: DatabaseSprintFieldType[] = [
    {
      value: NotionColumnType.SELECT,
      label: 'Select',
    },
    {
      value: NotionColumnType.MULTI_SELECT,
      label: 'Multi Select',
    },
  ];

  return (
    <div>
      <h3>Select Columns</h3>
      <SelectField
        label="Story Points (number field)"
        control={control}
        name="storyPointsId"
        // error={errors.storyPointsId}
        options={propertiesOptions.filter((o) => o.type === 'number')}
        rules={{ required: true }}
        isDisabled={!currentDatabaseSelected}
      />
      <SelectField
        className="mt-2"
        label="Status (select field)"
        control={control}
        name="ticketStatusId"
        // error={errors.ticketStatusId}
        options={propertiesOptions.filter((o) => o.type === 'select')}
        rules={{ required: true }}
        isDisabled={!currentDatabaseSelected}
      />
      <div className="flex flex-col sm:flex-row">
        <SelectField
          className="mt-2 mr-2"
          label="Sprint Field Type"
          control={control}
          name="sprintSelectType"
          options={sprintSelectTypeOptions}
          isDisabled={!currentDatabaseSelected}
          rules={{ required: true }}
        />
        <SelectField
          className="mt-2 flex-grow"
          label="Sprint (select/multi_select field)"
          control={control}
          name="sprintId"
          // error={errors.sprintId}
          options={propertiesOptions.filter((o) =>
            currentSprintSelectType?.value === NotionColumnType.SELECT
              ? o.type === 'select'
              : o.type === 'multi_select'
          )}
          rules={{ required: true }}
          isDisabled={!currentDatabaseSelected || !currentSprintSelectType}
        />
      </div>
    </div>
  );
};
