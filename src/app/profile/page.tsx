// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {getImageUrl} from "@/services/s3Service";


interface PlantIdentification {
  id: string;
  date: string;
  imageFileName: string;
  plantName: string;
}

export default function UserProfile() {
  const [plantHistory, setPlantHistory] = useState<PlantIdentification[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  // Mock user ID (replace with actual user authentication)
  const userId = "user123";

  useEffect(() => {
    const storedHistory = localStorage.getItem(`plantHistory-${userId}`);
    if (storedHistory) {
      const history = JSON.parse(storedHistory);
      setPlantHistory(history);

      // Fetch image URLs for each plant identification
      history.forEach(async (plant: PlantIdentification) => {
        try {
          const url = await getImageUrl(plant.imageFileName);
          setImageUrls(prev => ({ ...prev, [plant.id]: url }));
        } catch (error) {
          console.error(`Error fetching image URL for ${plant.imageFileName}:`, error);
        }
      });
    }
  }, [userId]);

  return (
    <main className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-green-800 text-shadow">User Profile</h1>
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Plant Identification History</h2>
          {plantHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantHistory.map((plant) => (
                <div key={plant.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="relative h-48">
                    {imageUrls[plant.id] && (
                      <Image
                        src={imageUrls[plant.id]}
                        alt={plant.plantName}
                        layout="fill"
                        objectFit="cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{plant.plantName}</h3>
                    <p className="text-sm text-gray-600">{plant.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No plant identifications yet.</p>
          )}
        </div>
        <div className="text-center">
          <Link href="/" className="text-green-600 hover:text-green-800 transition duration-300">
            Back to Plant Identifier
          </Link>
        </div>
      </div>
    </main>
  );
}