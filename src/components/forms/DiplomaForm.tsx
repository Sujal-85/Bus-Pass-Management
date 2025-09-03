import React from 'react';
import BusPassForm from './BusPassForm';

const DiplomaForm: React.FC = () => {
  return (
    <BusPassForm
      title="Diploma Student Bus Pass Form"
      formType="Diploma"
      departmentOptions={[
        'Computer Techology',
        'Mechanical Engineering',
        'Electronics & Telecommunication',
        'Civil Engineering',
        'Electrical Engineering',
        'Artificial Intelligence & Machine Learning',
      ]}
      maxYear={3}
    />
  );
};

export default DiplomaForm;


