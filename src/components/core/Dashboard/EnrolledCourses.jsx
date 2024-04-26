import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getProfileEnrolledCourses } from '../../../services/operations/profileAPIs';
import { useState } from 'react';
import ProgressBar from "@ramonak/react-progress-bar";
import { useNavigate } from 'react-router-dom';

const EnrolledCourses = () => {

    const {token} = useSelector((state) => state.auth);
    const [enrolledCourses, setEnrolledCourses] = useState(null);
    const navigate = useNavigate();

    const getEnrolledCourses = async() => {
        try{
            const response = await getProfileEnrolledCourses(token);
            setEnrolledCourses(response);
        }
        catch(error){
            console.log("Unable to Fetch the Courses")
        }
    }

    useEffect(() => {
        getEnrolledCourses();
    }, [])

    return (
        <div>

            <div className="text-3xl text-richblack-50">
                Enrolled Courses
            </div>
            {
                !enrolledCourses ? (
                    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                        <div className="spinner"></div>
                    </div>
                ) : !enrolledCourses.length ? (<div className="grid h-[10vh] w-full place-content-center text-richblack-50">
                    You have not Enrolled in any course yet
                </div>) : (
                    <div className="my-8 text-richblack-50">
                        <div className="flex rounded-t-lg bg-richblack-500 ">
                            <p className="w-[45%] px-5 py-3">Course Name</p>
                            <p className="w-1/4 px-2 py-3">Duration</p>
                            <p className="flex-1 px-2 py-3">Progress</p>
                        </div>
                        {
                            enrolledCourses.map((course, i, arr) => {
                                return (
                                    <div className={`flex items-center border border-richblack-700 ${
                                        i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
                                    }`}
                                    key={i}>
                                        <div className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                                            onClick={()=>{
                                                navigate(`/view-course/${course._id}/section/${course?.courseContent?.[0]?._id}/sub-section/${course?.courseContent?.[0]?.SubSection?.[0]?._id}`)
                                            }}
                                        >
                                            <img src={course.thumbnail} className="h-14 w-14 rounded-lg object-cover"/>
                                            <div className="flex max-w-xs flex-col gap-2">
                                                <p className="font-semibold">{course.name}</p>
                                                <p className="text-xs text-richblack-300">{course.description.length > 50
                                                    ? `${course.description.slice(0, 50)}...`
                                                    : course.description}</p>
                                            </div>
                                        </div>

                                        <div className="w-1/4 px-2 py-3">
                                            {course.totalDuration}
                                        </div>

                                        <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                                            <p>Progress: {course.progressPercentage}%</p>
                                            <ProgressBar
                                                completed={course.progressPercentage}
                                                height='8px'
                                                baseBgColor="#2C333F"
                                                labelClassName='label'
                                                bgColor={course.progressPercentage != 100 ? '#47A5C5' : '#06D6A0'}
                                            />
                                        </div>
                                    </div>
                                )
                                
                            })
                        }
                    </div>
                )
            }
        
        </div>
    )
}

export default EnrolledCourses
