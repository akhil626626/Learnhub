import React, { useEffect } from 'react'
import { IoIosArrowBack } from "react-icons/io"
import IconBtn from '../../Common/IconBtn'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { BsChevronDown } from "react-icons/bs"

const VideoDetailsSideBar = ({setReviewModal}) => {
    const navigate = useNavigate();
    const [activeStatus, setActiveStatus] = useState("");
    const [videoBarActive, setVideoBarActive] = useState("");
    const {sectionId, subSectionId} = useParams()
    const location = useLocation()
    const {courseSectionData, courseEntireData, totalNoOfLectures, completedLectures} = useSelector((state) => state.viewCourse)

    useEffect(() => {
        ;(() => {
            if(!courseSectionData.length){
                return
            }
            const currentSectionIndex = courseSectionData.findIndex((data) => data._id === sectionId)
            const currentSubSectionIndex = courseSectionData[currentSectionIndex]?.SubSection.findIndex((data) => data._id === subSectionId)
            const activeSubSectionId = courseSectionData[currentSectionIndex]?.SubSection[currentSubSectionIndex]._id
            setActiveStatus(courseSectionData[currentSectionIndex]?._id)
            setVideoBarActive(activeSubSectionId)
        })()
    }, [courseEntireData, courseSectionData, location.pathname])

    return (
        <div>
        <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
            <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
                <div className="flex w-full items-center justify-between ">
                    <div
                        onClick={() => {
                            navigate(`/dashboard/enrolled-courses`)
                        }}
                        className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90 cursor-pointer"
                        title="back"
                    >
                        <IoIosArrowBack size={30}/>
                    </div>
                    <IconBtn
                        text="Add Review"
                        customClasses="ml-auto"
                        onclick={() => setReviewModal(true)}
                    />
                </div>
                <div className="flex flex-col">
                    <p>{courseEntireData.name}</p>
                    <p className="text-sm font-semibold text-richblack-500">
                        {completedLectures?.length} / {totalNoOfLectures}
                    </p>
                </div>
            </div>
            <div className="h-[calc(100vh - 5rem)] overflow-y-auto">
                {
                    courseSectionData.map((course, index) => (
                        <div
                            className='mt-2 cursor-pointer text-sm text-richblack-5'
                            onClick={() => setActiveStatus(course?._id)}
                            key={index}
                        >
                            {/* Section */}
                            <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                                <div className="w-[70%] font-semibold">
                                    {course?.name}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`${
                                        activeStatus === course?._id
                                            ? "rotate-0"
                                            : "rotate-180"
                                        } transition-all duration-500`}
                                    >
                                        <BsChevronDown/>
                                    </span>
                                </div>
                            </div>

                            {/* {SubSections} */}
                            {
                                activeStatus === course?._id && 
                                <div className="transition-[height] duration-500 ease-in-out">
                                    {
                                        course.SubSection.map((topic, index) => (
                                            <div
                                            className={`flex gap-3 px-5 py-2 ${videoBarActive === topic._id ? "bg-yellow-200 font-semibold text-richblack-800" : "hover: bg-richblack-900"}`}
                                                key={index}
                                                onClick={() => {
                                                    navigate(`/view-course/${courseEntireData?._id}/section/${course?._id}/sub-section/${topic?._id}`)
                                                    setVideoBarActive(topic._id)
                                                }}
                                            >
                                                <input
                                                    type='checkbox'
                                                    checked={completedLectures.includes(topic?._id)}
                                                    onChange={() => {}}
                                                />
                                                {topic.title}
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    ))
                }
            </div>
        </div>
        </div>
    )
}

export default VideoDetailsSideBar
