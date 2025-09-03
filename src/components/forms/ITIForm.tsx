import React from 'react';
import BusPassForm from './BusPassForm';

const ITIForm: React.FC = () => {
  return (
    <BusPassForm
      title="ITI Student Bus Pass Form"
      formType="ITI"
      departmentOptions={[
        'Electrician',
        'Mechanical',
        'Electronics mechanic',
        'Welder',
      ]}
      maxYear={3}
    />
  );
};

export default ITIForm;


