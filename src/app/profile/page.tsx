// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';
import Image from 'next/image';

interface PlantIdentification {
  id: string;
  date: string;
  imageFileName: string;
  plantName: string;
}

export default function ProfilePage() {
  const { user } = useUser();
  const [plantHistory, setPlantHistory] = useState<PlantIdentification[]>([]);
  const [aiCredits, setAiCredits] = useState(10); // Default credits, adjust as needed

  useEffect(() => {
    if (user) {
      // Fetch plant history from localStorage
      const storedHistory = localStorage.getItem(`plantHistory-${user.id}`);
      if (storedHistory) {
        setPlantHistory(JSON.parse(storedHistory));
      }

      // In a real application, you would fetch AI credits from your backend
      // For now, we'll use a mock value
      setAiCredits(10);
    }
  }, [user]);

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <main className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-green-800">User Profile</h1>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
          <div className="flex items-center mb-6">
            <img
              src={user.hasImage ? user.imageUrl : ''}
              alt={user.fullName || 'User'}
              width={80}
              height={80}
              className="rounded-full mr-4"
            />
            <div>
              <h2 className="text-2xl font-semibold">{user.fullName}</h2>
              <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">AI Credits</h3>
            <p className="text-3xl font-bold text-green-600">{aiCredits}</p>
          </div>
          
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition duration-300">
            Back to Plant Identifier
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h3 className="text-xl font-semibold mb-4">Plant Identification History</h3>
          {plantHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantHistory.map((plant) => (
                <div key={plant.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="p-4">
                    <h4 className="font-semibold">{plant.plantName}</h4>
                    <p className="text-sm text-gray-600">{plant.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No plant identifications yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}