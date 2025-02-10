import React, { useEffect, useState } from 'react';

const LoadingText: React.FC = () => {
    const [loadingText, setLoadingText] = useState("loading");
    
    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingText(prev => {
                if (prev === "loading...") return "loading";
                if (prev === "loading") return "loading.";
                if (prev === "loading.") return "loading..";
                return "loading...";
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return <div className='pt-1' >{loadingText}</div>;
};

export default LoadingText;
