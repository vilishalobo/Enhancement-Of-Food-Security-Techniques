import React from 'react'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {

    const navigate= useNavigate();

  return (
    <div>
    <h1>
        Are you a Industry/Retailer/Customer?
        <button 
            onClick={()=>navigate("/register-blockchain")}> 
            Get Start 
        </button> 
         
        Are you a farmer?
        <button>
            Get Started
        </button>
    </h1>
    </div>
  )
}

export default LandingPage