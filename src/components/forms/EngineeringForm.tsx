import React from 'react';
import BusPassForm from './BusPassForm';

const EngineeringForm: React.FC = () => {
  return (
    <BusPassForm
      title="Engineering Bus Pass Form"
      formType="Engineering"
      departmentOptions={[
        'Computer Science and Engineering',
        'Artificial Intelligence & Machine Learning ',
        'Mechanical Engineering',
        'Electronics & Telecommunication',
        'Civil Engineering',
        'Electrical Engineering',
        'Electrical & Computer',
      ]}
      maxYear={4}
    />
  );
};

export default EngineeringForm;


