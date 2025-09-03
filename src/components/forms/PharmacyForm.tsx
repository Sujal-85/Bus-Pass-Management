import React from 'react';
import BusPassForm from './BusPassForm';

const PharmacyForm: React.FC = () => {
  return (
    <BusPassForm
      title="Pharmacy Student Bus Pass Form"
      formType="Pharmacy"
      departmentOptions={['D Pharmacy', 'B Pharmacy']}
      maxYear={4}
    />
  );
};

export default PharmacyForm;


