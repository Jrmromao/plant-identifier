// src/app/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import Link from 'next/link';
import ImageUpload from '@/app/components/ImageUpload';
import CameraCapture from '@/app/components/CameraCapture';
import PlantInfo from '@/app/components/PlantInfo';
import { uploadImage } from '@/services/s3Service';

interface PlantInfoData {
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
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [plantInfo, setPlantInfo] = useState<Partial<PlantInfoData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    setImage(file);
    setPlantInfo(null);
    setError(null);
  }, []);

  const handleImageCapture = useCallback((file: File) => {
    setImage(file);
    setPlantInfo(null);
    setError(null);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImage(null);
    setPlantInfo(null);
    setError(null);
  }, []);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fileToGenerativePart = async (file: File): Promise<Part> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1];
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type
          }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const identifyPlantWithRetry = async (file: File, retryCount = 0): Promise<Partial<PlantInfoData>> => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const imagePart = await fileToGenerativePart(file);
      const prompt = "Identify this plant and provide the following information:\n" +
        "1. Plant Name\n2. Scientific Name\n3. Family\n4. Origin\n5. Brief Description\n" +
        "6. Care Instructions\n7. Sunlight Needs\n8. Watering Needs\n9. Soil Type\n" +
        "10. Growth Habit\n11. Propagation\n12. Common Problems\n\n" +
        "If you're unsure about any information, please respond with 'Unknown' for that field.\n" +
        "Format the response as follows:\n" +
        "Name: [Plant Name]\nScientific Name: [Scientific Name]\nFamily: [Family]\n" +
        "Origin: [Origin]\nDescription: [Brief Description]\n" +
        "Care Instructions: [Care Instructions]\nSunlight Needs: [Sunlight Needs]\n" +
        "Watering Needs: [Watering Needs]\nSoil Type: [Soil Type]\n" +
        "Growth Habit: [Growth Habit]\nPropagation: [Propagation]\n" +
        "Common Problems: [Common Problems]";

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const plantInfoObj: Partial<PlantInfoData> = {};
      const lines = text.split('\n');
      
      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        if (key && value && value !== "Unknown") {
          const formattedKey = key.trim().toLowerCase().replace(/\s+/g, '') as keyof PlantInfoData;
          plantInfoObj[formattedKey] = value;
        }
      });

      if (Object.keys(plantInfoObj).length === 0) {
        throw new Error('No plant information could be extracted from the AI response.');
      }

      return plantInfoObj;
    
    } catch (error: unknown) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      if (retryCount < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY);
        return identifyPlantWithRetry(file, retryCount + 1);
      }
      if (error instanceof Error) {
        throw new Error(`Plant identification failed after ${MAX_RETRIES} attempts: ${error.message}`);
      } else {
        throw new Error(`Plant identification failed after ${MAX_RETRIES} attempts due to an unknown error`);
      }
    }
  };

  const savePlantIdentification = async (plantName: string, file: File) => {
    try {
      const fileName = await uploadImage(file, 'user123'); // Replace 'user123' with actual user ID when auth is implemented
      const newIdentification = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        imageFileName: fileName,
        plantName,
      };

      const storedHistory = localStorage.getItem('plantHistory-user123'); // Replace 'user123' with actual user ID
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      history.unshift(newIdentification);
      localStorage.setItem('plantHistory-user123', JSON.stringify(history.slice(0, 10))); // Keep only last 10
    } catch (error) {
      console.error("Error saving plant identification:", error);
    }
  };

  const identifyPlant = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const plantInfoObj = await identifyPlantWithRetry(image);
      setPlantInfo(plantInfoObj);
      
      if (plantInfoObj.name) {
        await savePlantIdentification(plantInfoObj.name, image);
      }
    } catch (error: unknown) {
      console.error('Error identifying plant after retries:', error);
      setError('We\'re experiencing technical difficulties with our plant identification service. Please try again later or contact support if the issue persists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-green-800 text-shadow">Plant Identifier</h1>
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="mb-4">
            <ImageUpload onImageUpload={handleImageUpload} onRemoveImage={handleRemoveImage} currentImage={image} />
          </div>
          {isMobile && (
            <div className="mb-4">
              <CameraCapture onCapture={handleImageCapture} />
            </div>
          )}
          <button
            onClick={identifyPlant}
            disabled={!image || loading}
            className="w-full mt-4 bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold shadow-md"
          >
            {loading ? 'Identifying...' : 'Identify Plant'}
          </button>
          {error && (
            <p className="mt-4 text-red-500 text-center">{error}</p>
          )}
        </div>
        {plantInfo && <PlantInfo plantInfo={plantInfo} />}
        <div className="text-center mt-6 sm:mt-8">
          <Link href="/profile" className="text-green-600 hover:text-green-800 transition duration-300">
            View Your Plant Identification History
          </Link>
        </div>
      </div>
    </main>
  );
}
