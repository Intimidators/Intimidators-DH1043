const {
  INTERNAL_SERVER_ERROR_RC,
  CREATED_RC,
  OK_RC,
  NOT_FOUND_RC,
  BAD_REQUEST_RC,
  CONFLICT_RC,
} = require("../utils/ResponseCodes");
const WebinarInfoModel = require("../models/WebinarInfoModel");
const {
  FIND_USER_BY_USERID_QUERY,
} = require("../configs/databaseConfig/DatabaseQueries");
const { makeDbCall } = require("../utils/DatabaseCalls");
const { sendRegisteredForWebinarEmail } = require("../utils/EmailSender");
const axios = require("axios").create({
  baseUrl: process.env.ZOOM_API_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.ZOOM_API_AUTH_TOKEN}}`,
    "Content-Type": "application/json",
  },
});

// Zoom callback event type CONSTANTS
const PARTICIPANT_JOINED = "meeting.participant_joined";
const PARTICIPANT_LEFT = "meeting.participant_left";
const MEETING_ENDED = "meeting.ended";
const MEETING_STARTED = "meeting.started";

let coverPhotoMap = new Map([
  [
    "vvgnli",
    "https://vvgnli-awsmediabucket.s3.us-west-1.amazonaws.com/37ffbef6-7eca-4427-bcfc-77b5ec869ab4.jpg",
  ],
  [
    "gujarat",
    "https://vvgnli-awsmediabucket.s3.us-west-1.amazonaws.com/d0cbea64-8c45-4586-a392-eb1207d7ebd8.jpg",
  ],
  [
    "kerala",
    "https://vvgnli-awsmediabucket.s3.us-west-1.amazonaws.com/26b3de94-8f70-4016-b475-00732e88928e.png",
  ],
  [
    "odisha",
    "https://vvgnli-awsmediabucket.s3.us-west-1.amazonaws.com/2d67822f-54a8-408a-9b36-b853cca0753f.jpg",
  ],
  [
    "jharkhand",
    "https://vvgnli-awsmediabucket.s3.us-west-1.amazonaws.com/2977cacf-9036-460f-b656-9625e2b838ff.jpg",
  ],
]);

// completed
exports.CreateNewWebinar = async (req, res) => {
  const CREATE_MEET_URL = `${process.env.ZOOM_API_BASE_URL}/users/${process.env.ZOOM_API_AUTH_USERID}/meetings`;
  const meetingProps = req.meetingProps;

  try {
    const createApiResponse = await axios.post(CREATE_MEET_URL, meetingProps);
    const data = createApiResponse.data;

    console.log(meetingProps);

    const dbResponse = await saveWebinarInfo(data, meetingProps);

    if (!dbResponse.success) {
      return res.status(dbResponse.status).json({
        message: dbResponse.message,
        status: dbResponse.status,
        success: false,
      });
    }

    return res.status(CREATED_RC).json({
      message: "Webinar created successfully",
      webinarId: data.id,
      success: true,
    });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: `Something went wrong. ${err.message}`,
      status: INTERNAL_SERVER_ERROR_RC,
      success: false,
    });
  }
};

// completed
exports.deleteWebinar = async (req, res) => {
  const webinarId = req.body.webinarId;

  const deleteResponse = await WebinarInfoModel.deleteOne({ webinarId });

  if (!deleteResponse) {
    return res
      .status(INTERNAL_SERVER_ERROR_RC)
      .json({ message: "Internal server error", success: false });
  }

  const deleteCount = deleteResponse?.deletedCount;

  if (!deleteCount || deleteCount === 0) {
    return res.status(OK_RC).json({
      message: "No webinar deleted",
      success: false,
    });
  }

  return res.status(OK_RC).json({
    message: `Webinar successfully removed: ${deleteCount}`,
    success: true,
    deleteResponse,
  });
};

// completed
exports.getWebinarInfo = async (req, res) => {
  const webinarId = req.query.webinarId;

  try {
    const getMeetingInfoQueryResult = await getWebinarInfoByWebinarId(
      webinarId,
      false
    );

    if (!getMeetingInfoQueryResult.success) {
      return res.status(getMeetingInfoQueryResult.status).json({
        message: getMeetingInfoQueryResult.message,
        status: getMeetingInfoQueryResult.status,
        success: false,
      });
    }

    const webinar = getMeetingInfoQueryResult.webinar;

    if (!webinar) {
      return res.status(NOT_FOUND_RC).json({
        message: `No webinar found for webinarId: ${webinarId}`,
        status: NOT_FOUND_RC,
        success: false,
      });
    }

    return res.status(OK_RC).json({
      message: "Webinar details Fetched successfully",
      success: true,
      webinarDetails: webinar,
    });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: "Something went wrong",
      status: INTERNAL_SERVER_ERROR_RC,
      success: false,
    });
  }
};

// completed
exports.addParticipantJoinedFromPortal = async (req, res) => {
  const { webinarId, userId, email, timestamp, ip } =
    req.platformJoinedUserInfo;

  try {
    const webinarInfo = await getWebinarInfoByWebinarId(webinarId, true);

    if (!webinarInfo.success) {
      return res.status(webinarInfo.status).json({
        message: `Invalid webinarId: ${webinarId}`,
        status: webinarInfo.status,
        success: false,
      });
    }

    const webinar = webinarInfo.webinar;

    if (!webinar) {
      return res.status(NOT_FOUND_RC).json({
        message: `No webinar found for webinarId: ${webinarId}`,
        status: NOT_FOUND_RC,
        success: false,
      });
    }

    webinar.usersJoinedFromPlatform?.push({
      userId,
      email,
      timestamp,
      ip,
    });

    webinar.save();

    return res.status(OK_RC).json({ message: "Success" });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: `Something went wrong: ${err.message}`,
      status: INTERNAL_SERVER_ERROR_RC,
      success: false,
    });
  }
};

// completed
exports.getJoinedUsersInformation = async (req, res) => {
  const webinarId = req.query.webinarId;

  const webinarResult = await getWebinarInfoByWebinarId(webinarId, true);

  if (!webinarResult.success) {
    return res.status(webinarResult.status).json({
      message: webinarResult.message,
      status: webinarResult.status,
      success: false,
    });
  }

  const webinar = webinarResult.webinar;

  if (!webinar) {
    return res.status(BAD_REQUEST_RC).json({
      message: `Webinar not found with id: ${webinarId}`,
      success: false,
    });
  }

  return res.status(OK_RC).json({
    message: "Webinar info fetch success",
    usersJoinedFromPlatform: webinar?.usersJoinedFromPlatform,
    joinedUsers: webinar?.joinedUsers,
    success: true,
  });
};

// completed
exports.ZoomCallbackHandler = (req, res) => {
  const eventType = getCallbackEventType(req);

  switch (eventType) {
    case MEETING_STARTED:
      setMeetingAsStarted(req);
      break;

    case MEETING_ENDED:
      setMeetingAsCompleted(req);
      break;

    case PARTICIPANT_JOINED:
      addParticipantJoinEntry(req);
      break;

    case PARTICIPANT_LEFT:
      addParticipantLeftEntry(req);
      break;

    default:
      break;
  }

  return res.status(OK_RC).json({ message: "Callback received" });
};

// completed
exports.RegisterParticipant = async (req, res) => {
  const { webinarId, userId, userIp } = req.body;

  const getWebinarByWebinarId = await getWebinarInfoForUserRegistration(
    webinarId
  );

  if (!getWebinarByWebinarId.success || !getWebinarByWebinarId.webinar) {
    return res.status(NOT_FOUND_RC).json({
      message: "Invalid webinar id",
      success: false,
      status: NOT_FOUND_RC,
    });
  }

  const getUserByUserId = await getUserInfoByUserId(userId);

  if (!getUserByUserId.success || !getUserByUserId.user) {
    return res.status(NOT_FOUND_RC).json({
      message: "Invalid user id",
      success: false,
      status: NOT_FOUND_RC,
    });
  }

  const webinar = getWebinarByWebinarId.webinar;
  const user = getUserByUserId.user;

  // checking if user is already registered or not
  webinar.registerdUsers.forEach((registeredUser) => {
    if (registeredUser.userId === userId) {
      return res.status(CONFLICT_RC).json({
        message: "You are already registered for this webinar",
        success: false,
        status: CONFLICT_RC,
      });
    }
  });

  webinar.registerdUsers.push({
    userId: userId,
    email: user?.emailAddress,
    ip: userIp,
  });

  webinar.save();

  sendRegisteredForWebinarEmail(user.emailAddress, user.name, webinar.topic);

  return res.status(OK_RC).json({
    message: "Registration successful",
    success: true,
    status: OK_RC,
  });
};

exports.GetRegisteredUsers = async (req, res) => {
  const webinarId = req.query.webinarId;
  const webinar = await getWebinarInfoForGetRegisteredUsers(webinarId);

  if (!webinar) {
    return res.status(NOT_FOUND_RC).json({
      message: "Webinar not found",
      success: false,
    });
  }

  return res
    .status(OK_RC)
    .json({ registeredUsers: webinar.registerdUsers, success: true });
};

exports.GetPastWebinars = async (req, res) => {
  const state = req.body.state;

  try {
    const webinars = await WebinarInfoModel.find({
      completed: true,
      ongoing: false,
      state,
    }).select({
      usersJoinedFromPlatform: 0,
      joinedUsers: 0,
      registerdUsers: 0,
    });

    if (!webinars) {
      return res.status(INTERNAL_SERVER_ERROR_RC).json({
        message: "Error fetching past webinars",
        success: false,
        status: INTERNAL_SERVER_ERROR_RC,
      });
    }

    return res.status(OK_RC).json({
      webinars: webinars.map((webinar) => {
        return {
          webinarId: webinar.webinarId,
          recordingUrl: webinar.recordingUrl,
          state: webinar.state,
          topic: webinar.topic,
          agenda: webinar.agenda,
          department: webinar.department,
          host: webinar.host,
          coverPhoto: webinar.coverPhoto,
        };
      }),
      success: true,
    });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: "Error fetching past webinars",
      success: false,
      status: INTERNAL_SERVER_ERROR_RC,
    });
  }
};

exports.GetOngoingWebinars = async (req, res) => {
  const state = req.body.state;

  try {
    const webinars = await WebinarInfoModel.find({
      completed: false,
      ongoing: true,
      state,
    }).select({
      usersJoinedFromPlatform: 0,
      joinedUsers: 0,
      registerdUsers: 0,
    });

    if (!webinars) {
      return res.status(INTERNAL_SERVER_ERROR_RC).json({
        message: "Error fetching ongoing webinars",
        success: false,
        status: INTERNAL_SERVER_ERROR_RC,
      });
    }

    return res.status(OK_RC).json({ webinars: webinars, success: true });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: "Error fetching ongoing webinars",
      success: false,
      status: INTERNAL_SERVER_ERROR_RC,
    });
  }
};

exports.getFutureScheduledWebinars = async (req, res) => {
  const state = req.body.state;

  try {
    const webinars = await WebinarInfoModel.find({
      completed: false,
      ongoing: false,
      state,
    }).select({
      usersJoinedFromPlatform: 0,
      joinedUsers: 0,
      registerdUsers: 0,
    });

    if (!webinars) {
      return res.status(INTERNAL_SERVER_ERROR_RC).json({
        message: "Error fetching future scheduled webinars",
        success: false,
        status: INTERNAL_SERVER_ERROR_RC,
      });
    }

    return res.status(OK_RC).json({ webinars: webinars, success: true });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: "Error fetching future scheduled webinars",
      success: false,
      status: INTERNAL_SERVER_ERROR_RC,
    });
  }
};

const getWebinarInfoForGetRegisteredUsers = async (webinarId) => {
  try {
    return await WebinarInfoModel.findOne({ webinarId }).select({
      registerdUsers: 1,
    });
  } catch (err) {
    return null;
  }
};

// completed
const getWebinarIdFromRequestBody = (req) => {
  return req.body.payload.object.id;
};

// completed
const getWebinar = async (req, includeUsersFields) => {
  // fetching webinarId from callback data
  const webinarId = getWebinarIdFromRequestBody(req);

  if (!webinarId) {
    return null;
  }

  // fetching webinarInfo from Db using webinarId
  const webinarInfo = await getWebinarInfoByWebinarId(
    webinarId,
    includeUsersFields
  );

  if (!webinarInfo.success || !webinarInfo.webinar) {
    return null;
  }

  // get webinar from webinarInfo object
  const webinar = webinarInfo.webinar;

  return webinar;
};

// completed
const saveWebinarInfo = async (data, meetingProps) => {
  const webinarJson = {
    webinarId: data.id,
    adminUserId: meetingProps.adminUserId,
    startTime: meetingProps.start_time,
    duration: meetingProps.duration,
    topic: data.topic,
    department: meetingProps.departmentName,
    type: data.type,
    timezone: data.timezone,
    agenda: data.agenda,
    startUrl: data.start_url,
    joinUrl: data.join_url,
    password: data.password,
    state: meetingProps.state,
    coverPhoto: coverPhotoMap.get(meetingProps.state),
    host: meetingProps.host,
  };

  try {
    await WebinarInfoModel.create(webinarJson);
    return { success: true, status: OK_RC };
  } catch (err) {
    return {
      message: err.message,
      status: INTERNAL_SERVER_ERROR_RC,
      success: false,
    };
  }
};

// completed
const getWebinarInfoByWebinarId = async (webinarId, includeUsersFields) => {
  try {
    let webinar;

    if (!includeUsersFields) {
      webinar = await WebinarInfoModel.findOne({ webinarId }).select({
        usersJoinedFromPlatform: 0,
        joinedUsers: 0,
        registerdUsers: 0,
      });
    } else {
      webinar = await WebinarInfoModel.findOne({ webinarId });
    }

    return {
      webinar,
      success: true,
    };
  } catch (err) {
    return {
      status: NOT_FOUND_RC,
      success: false,
      message: `Webinar not found for id: ${webinarId}`,
    };
  }
};

// completed
const getWebinarInfoForUserRegistration = async (webinarId) => {
  try {
    const webinar = await WebinarInfoModel.findOne({ webinarId }).select({
      webinarId: 1,
      registerdUsers: 1,
      topic: 1,
    });

    if (!webinar) {
      return { success: false };
    }

    return { success: true, webinar };
  } catch (err) {
    return { success: false };
  }
};

// completed
const getUserInfoByUserId = async (userId) => {
  try {
    const findUserByIdQuery = await makeDbCall(FIND_USER_BY_USERID_QUERY, [
      userId,
    ]);

    if (!findUserByIdQuery.success || !findUserByIdQuery.response[0][0]) {
      return { success: false };
    }

    return { success: true, user: findUserByIdQuery.response[0][0] };
  } catch (err) {
    return { success: false };
  }
};

// completed
const getCallbackEventType = (req) => {
  return req.body.event;
};

// completed
const setMeetingAsStarted = async (req) => {
  const webinar = await getWebinar(req);

  if (!webinar) {
    return;
  }

  // setting webinar as started (ongoing)
  webinar.ongoing = true;
  webinar.completed = false;

  // saving updated data back to DB
  webinar.save();
};

// completed
const setMeetingAsCompleted = async (req) => {
  const webinar = await getWebinar(req);

  console.log("Callback payload: ", req.body);

  if (!webinar) {
    return;
  }

  // setting webinar as started (ongoing)
  webinar.ongoing = false;
  webinar.completed = true;
  webinar.recordingUrl = "Dummy Recording URL";

  // saving updated data to DB
  webinar.save();
};

// pending
const addParticipantJoinEntry = async (req) => {
  const webinar = await getWebinar(req);

  if (!webinar) {
    return;
  }
};

// pending
const addParticipantLeftEntry = async (req) => {
  // TODO
};
