export interface ClickMeetingConference{
    id: number,
    url: string
    instructorAccess: ClickMeetingInstructorAccess
}

export interface ClickMeetingInstructorAccess{
    url: string,
    token: string
}