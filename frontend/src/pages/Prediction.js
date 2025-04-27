import React, { useState, useEffect } from "react";
import "../App1.css"; 

function App() {
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the Flask API
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/predictions");
        if (!response.ok) {
          throw new Error("Failed to fetch predictions.");
        }
        const data = await response.json();
        setPredictions(data.predictions);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading predictions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App">
      <div className="App_container">
      <h1>Future Fruit Requirements for Juices, Jams, Canned Goods, and Dried Fruits</h1>
      <div className="predictions">
        {Object.keys(predictions).map((fruit, index) => (
          <div key={index} className="fruit-prediction">
            <h2>{fruit.charAt(0).toUpperCase() + fruit.slice(1)}</h2>
            {predictions[fruit].map((item, i) => (
              <p key={i}>
                Year: <strong>{item.year}</strong>, Predicted Requirement: <strong>{(item.value * 0.453592*1000000).toFixed(2)} Kgs</strong>
              </p>
            ))}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default App;