// src/components/PlantInfo.tsx
import React from 'react';

interface PlantInfoProps {
  plantInfo: Partial<{
    name: string;
    scientificName: string;
    family: string;
    origin: string;
    description: string;
    careInstructions: string;
    sunlightNeeds: string;
    wateringNeeds: string;
    soilType: string;
    growthHabit: string;
    propagation: string;
    commonProblems: string;
  }>;
}

const PlantInfo: React.FC<PlantInfoProps> = ({ plantInfo }) => {
  const infoItems = [
    { label: 'Scientific Name', value: plantInfo.scientificName },
    { label: 'Family', value: plantInfo.family },
    { label: 'Origin', value: plantInfo.origin },
    { label: 'Sunlight Needs', value: plantInfo.sunlightNeeds },
    { label: 'Watering Needs', value: plantInfo.wateringNeeds },
    { label: 'Soil Type', value: plantInfo.soilType },
    { label: 'Growth Habit', value: plantInfo.growthHabit },
    { label: 'Propagation', value: plantInfo.propagation },
  ].filter(item => item.value);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
      <h2 className="text-2xl font-bold text-green-800 mb-2">{plantInfo.name || 'Unidentified Plant'}</h2>
      {plantInfo.description && <p className="text-gray-600 mb-6">{plantInfo.description}</p>}
      
      {infoItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {infoItems.map((item, index) => (
            <div key={index} className="border-b border-gray-200 pb-2">
              <h3 className="text-sm font-semibold text-gray-600">{item.label}</h3>
              <p className="text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {plantInfo.careInstructions && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Care Instructions</h3>
          <p className="text-gray-700">{plantInfo.careInstructions}</p>
        </div>
      )}

      {plantInfo.commonProblems && (
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">Common Problems</h3>
          <p className="text-gray-700">{plantInfo.commonProblems}</p>
        </div>
      )}

      {Object.keys(plantInfo).length === 0 && (
        <p className="text-yellow-600">No information available for this plant. Please try again with a different image.</p>
      )}
    </div>
  );
};

export default PlantInfo;