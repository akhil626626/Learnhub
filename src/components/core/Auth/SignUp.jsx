import React from 'react'
import Template from './Template'
import signUpImg from "../../../assets/Images/signup.webp"
import { useSelector } from 'react-redux'

const SignUp = () => {
  const {loading} = useSelector((state) => state.auth);
  return (
      <div className='flex items-center justify-center mx-auto'>
        {
          loading ? (
            <div className="spinner mt-[350px]"></div>
          ) : (
            <div>
                <Template 
                    title="Join the millions learning to code with LearnHub"
                    description1="Develop abilities for the future and the present."
                    description2="Investing in education to secure your future."
                    image={signUpImg}
                    formType="signup"
                />
            </div>
          )
        }
      </div>
  )
}

export default SignUp
