import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HumanVerificationProps {
  onVerificationChange: (verified: boolean) => void;
  className?: string;
}

//TODO: later upgrade this to a more secure verification method (reCaptcha or something else)
const HumanVerification = ({ onVerificationChange, className = "" }: HumanVerificationProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [challenge, setChallenge] = useState<{
    question: string;
    options: string[];
    answer: string;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  // Generate a simple challenge
  const generateChallenge = () => {
    const challenges = [
      {
        question: "Select the animal",
        options: ["🐶 Dog", "🏠 House", "🚗 Car", "📱 Phone"],
        answer: "🐶 Dog"
      },
      {
        question: "Select the fruit",
        options: ["🍎 Apple", "🚲 Bicycle", "✏️ Pencil", "👕 Shirt"],
        answer: "🍎 Apple"
      },
      {
        question: "Select the vehicle",
        options: ["🌳 Tree", "🚢 Ship", "🍕 Pizza", "📚 Book"],
        answer: "🚢 Ship"
      },
      {
        question: "Select the weather",
        options: ["☀️ Sunny", "🎸 Guitar", "👟 Shoe", "🍔 Burger"],
        answer: "☀️ Sunny"
      },
      {
        question: "Select the number",
        options: ["🏀 Basketball", "5️⃣ Five", "🌮 Taco", "🎨 Paint"],
        answer: "5️⃣ Five"
      }
    ];
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  };

  const handleVerificationClick = () => {
    if (isVerified) return;
    
    setChallenge(generateChallenge());
    setSelectedOption(null);
    setShowChallenge(true);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsLoading(true);
    
    // Simulate verification delay
    setTimeout(() => {
      const success = option === challenge?.answer;
      setIsVerified(success);
      setShowChallenge(!success);
      setIsLoading(false);
      onVerificationChange(success);
    }, 1000);
  };

  const handleReset = () => {
    setIsVerified(false);
    setChallenge(null);
    setSelectedOption(null);
    setShowChallenge(false);
    onVerificationChange(false);
  };

  useEffect(() => {
    // Reset verification when component mounts
    setIsVerified(false);
    onVerificationChange(false);
  }, [onVerificationChange]);

  return (
    <div className={`mt-8 pt-8 border-t border-gray-200 ${className}`}>
      {!showChallenge ? (
        <div 
          className="flex items-center justify-center gap-2 cursor-pointer"
          onClick={handleVerificationClick}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isVerified ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"
          }`}>
            {isVerified ? <Check size={16} /> : <span className="text-sm font-medium">?</span>}
          </div>
          <span className="text-sm text-gray-500">
            {isVerified ? "Verified human" : "I am human"}
          </span>
          {isVerified && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-6 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
            >
              <RefreshCw size={14} />
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="bg-gray-50 p-4 rounded-lg"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-3">{challenge?.question}</h3>
          <div className="grid grid-cols-2 gap-2">
            {challenge?.options.map((option) => (
              <Button
                key={option}
                variant="outline"
                size="sm"
                className={`justify-start ${
                  selectedOption === option ? "border-emerald-500 bg-emerald-50" : ""
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !isLoading && handleOptionSelect(option)}
                disabled={isLoading}
              >
                {option}
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HumanVerification;