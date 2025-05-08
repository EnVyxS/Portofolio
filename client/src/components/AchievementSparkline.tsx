import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { AchievementType } from '../constants/achievementConstants';

// Define timestamp format for achievements
interface AchievementTimestamp {
  achievement: AchievementType;
  timestamp: number;
}

// Define props for the sparkline component
interface AchievementSparklineProps {
  className?: string;
}

// Enhanced tooltip for the sparkline
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="achievement-sparkline-tooltip">
        <p className="achievement-name">{data.achievement}</p>
        <p className="achievement-time">
          {new Date(data.timestamp).toLocaleDateString()} {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      </div>
    );
  }
  
  return null;
};

// Main sparkline component
const AchievementSparkline: React.FC<AchievementSparklineProps> = ({ className }) => {
  const [achievementData, setAchievementData] = useState<Array<{
    achievement: string;
    index: number;
    value: number;
    timestamp: number;
  }>>([]);
  
  // Load achievement timestamps
  useEffect(() => {
    // Try to load from localStorage
    const timestampsData = localStorage.getItem('achievementTimestamps');
    
    if (timestampsData) {
      try {
        const parsedData = JSON.parse(timestampsData) as AchievementTimestamp[];
        
        // Convert timestamps to an array for the sparkline
        const formattedData = parsedData.map((item, index) => ({
          achievement: item.achievement,
          index: index + 1, // 1-based index for the x-axis
          value: index + 1, // Value for the y-axis (cumulative achievement count)
          timestamp: item.timestamp
        }));
        
        setAchievementData(formattedData);
      } catch (error) {
        console.error('Error parsing achievement timestamps:', error);
        // Initialize with empty data on error
        setAchievementData([]);
      }
    } else {
      // If no data exists yet
      setAchievementData([]);
    }
  }, []);
  
  // If there's no history data, show a placeholder message
  if (achievementData.length === 0) {
    return (
      <motion.div
        className={`achievement-sparkline-container ${className || ''} empty-state`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="empty-sparkline">
          Your achievement history will appear here
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className={`achievement-sparkline-container ${className || ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="sparkline-title">Achievement Progress Over Time</div>
      
      <div className="sparkline-chart">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={achievementData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="rgba(255, 215, 0, 0.8)"
              strokeWidth={2}
              dot={{ 
                r: 3, 
                strokeWidth: 1, 
                fill: "#1a1a1a", 
                stroke: "rgba(255, 215, 0, 0.8)" 
              }}
              activeDot={{ 
                r: 5, 
                strokeWidth: 1, 
                fill: "rgba(255, 215, 0, 0.9)", 
                stroke: "#fff",
                strokeOpacity: 0.8
              }}
            />
            <Tooltip content={<CustomTooltip />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .achievement-sparkline-container {
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 6px;
          padding: 12px;
          margin-top: 10px;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        
        .sparkline-title {
          font-size: 0.8rem;
          color: rgba(255, 215, 0, 0.7);
          margin-bottom: 8px;
          text-align: center;
          font-family: "EB Garamond", serif;
        }
        
        .sparkline-chart {
          height: 60px;
          width: 100%;
        }
        
        .achievement-sparkline-tooltip {
          background: rgba(30, 30, 30, 0.95);
          border: 1px solid rgba(255, 215, 0, 0.4);
          padding: 8px 12px;
          border-radius: 4px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.6);
          font-size: 0.75rem;
        }
        
        .achievement-sparkline-tooltip .achievement-name {
          color: rgba(255, 215, 0, 0.9);
          font-weight: bold;
          margin: 0 0 4px;
          text-transform: uppercase;
        }
        
        .achievement-sparkline-tooltip .achievement-time {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: 0.7rem;
        }
        
        .empty-sparkline {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
          font-size: 0.8rem;
          background: linear-gradient(90deg, 
            rgba(40, 40, 40, 0.3) 0%, 
            rgba(60, 60, 60, 0.3) 50%, 
            rgba(40, 40, 40, 0.3) 100%);
          border-radius: 4px;
        }
      `}} />
    </motion.div>
  );
};

export default AchievementSparkline;