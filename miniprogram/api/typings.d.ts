declare namespace API {
  type Attractions = {
    id?: string
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    attractionsImg?: string;
    attractionsVideo?: string;
    attractionsNote?: string;
    inspectorId?: string;
    userId?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type AttractionsAddRequest = {
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    attractionsImg?: string;
    attractionsVideo?: string;
    attractionsNote?: string;
    attractionsTypeIds?: number[];
    inspectorId?: string;
  };

  type AttractionsQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    notId?: string;
    searchText?: string;
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    attractionsNote?: string;
    attractionsTypeIds?: number[];
    inspectorId?: string;
    userId?: string;
  };

  type AttractionsRoute = {
    id?: string
    startAttractionId?: string;
    endAttractionId?: string;
    startAttractionImg?: string;
    endAttractionImg?: string;
    startAttractionVideo?: string;
    endAttractionVideo?: string;
    routeNote?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type AttractionsRouteAddRequest = {
    startAttractionId?: string;
    endAttractionId?: string;
    startAttractionImg?: string;
    endAttractionImg?: string;
    startAttractionVideo?: string;
    endAttractionVideo?: string;
    routeNote?: string;
  };

  type AttractionsRouteQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    notId?: string;
    searchText?: string;
    startAttractionId?: string;
    endAttractionId?: string;
    routeNote?: string;
  };

  type AttractionsRouteUpdateRequest = {
    id?: string
    startAttractionId?: string;
    endAttractionId?: string;
    startAttractionImg?: string;
    endAttractionImg?: string;
    startAttractionVideo?: string;
    endAttractionVideo?: string;
    routeNote?: string;
  };

  type AttractionsRouteVO = {
    id?: string
    startAttractionId?: string;
    endAttractionId?: string;
    startAttractionName?: string;
    startAttractionLng?: number;
    startAttractionLat?: number;
    endAttractionName?: string;
    endAttractionLng?: number;
    endAttractionLat?: number;
    startAttractionImg?: string;
    endAttractionImg?: string;
    startAttractionVideo?: string;
    endAttractionVideo?: string;
    routeNote?: string;
    createTime?: string;
    updateTime?: string;
  };

  type AttractionsTypeAddRequest = {
    typeName?: string;
    typeDescription?: string;
  };

  type AttractionsTypeUpdateRequest = {
    id?: string
    typeName?: string;
    typeDescription?: string;
  };

  type AttractionsTypeVO = {
    id?: string
    typeName?: string;
    typeDescription?: string;
    createTime?: string;
    updateTime?: string;
  };

  type AttractionsUpdateRequest = {
    id?: string
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    attractionsImg?: string;
    attractionsVideo?: string;
    attractionsNote?: string;
    attractionsTypeIds?: number[];
    inspectorId?: string;
  };

  type AttractionsVO = {
    id?: string
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    attractionsImg?: string;
    attractionsVideo?: string;
    attractionsNote?: string;
    attractionsTypes?: AttractionsTypeVO[];
    inspectorId?: string;
    inspectorName?: string;
    userId?: string;
    user?: UserVO;
    createTime?: string;
    updateTime?: string;
  };

  type BaseResponseAttractionsRouteVO = {
    code?: number;
    data?: AttractionsRouteVO;
    message?: string;
  };

  type BaseResponseAttractionsVO = {
    code?: number;
    data?: AttractionsVO;
    message?: string;
  };

  type BaseResponseBoolean = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseListAttractionsTypeVO = {
    code?: number;
    data?: AttractionsTypeVO[];
    message?: string;
  };

  type BaseResponseLoginUserVO = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseNaturalDisastersVO = {
    code?: number;
    data?: NaturalDisastersVO;
    message?: string;
  };

  type BaseResponseNaturalWeatherVO = {
    code?: number;
    data?: NaturalWeatherVO;
    message?: string;
  };

  type BaseResponsePageAttractions = {
    code?: number;
    data?: PageAttractions;
    message?: string;
  };

  type BaseResponsePageAttractionsRoute = {
    code?: number;
    data?: PageAttractionsRoute;
    message?: string;
  };

  type BaseResponsePageAttractionsRouteVO = {
    code?: number;
    data?: PageAttractionsRouteVO;
    message?: string;
  };

  type BaseResponsePageAttractionsVO = {
    code?: number;
    data?: PageAttractionsVO;
    message?: string;
  };

  type BaseResponsePageNaturalDisastersVO = {
    code?: number;
    data?: PageNaturalDisastersVO;
    message?: string;
  };

  type BaseResponsePageNaturalWeatherVO = {
    code?: number;
    data?: PageNaturalWeatherVO;
    message?: string;
  };

  type BaseResponsePagePublicizeVideo = {
    code?: number;
    data?: PagePublicizeVideo;
    message?: string;
  };

  type BaseResponsePagePublicizeVideoVO = {
    code?: number;
    data?: PagePublicizeVideoVO;
    message?: string;
  };

  type BaseResponsePagePublicizeWxPlatform = {
    code?: number;
    data?: PagePublicizeWxPlatform;
    message?: string;
  };

  type BaseResponsePagePublicizeWxPlatformVO = {
    code?: number;
    data?: PagePublicizeWxPlatformVO;
    message?: string;
  };

  type BaseResponsePageTaskCheckinVO = {
    code?: number;
    data?: PageTaskCheckinVO;
    message?: string;
  };

  type BaseResponsePageTaskDisposalVO = {
    code?: number;
    data?: PageTaskDisposalVO;
    message?: string;
  };

  type BaseResponsePageTaskInspectionVO = {
    code?: number;
    data?: PageTaskInspectionVO;
    message?: string;
  };

  type BaseResponsePageTaskTrackVO = {
    code?: number;
    data?: PageTaskTrackVO;
    message?: string;
  };

  type BaseResponsePageUser = {
    code?: number;
    data?: PageUser;
    message?: string;
  };

  type BaseResponsePageUserVO = {
    code?: number;
    data?: PageUserVO;
    message?: string;
  };

  type BaseResponsePublicizeVideoVO = {
    code?: number;
    data?: PublicizeVideoVO;
    message?: string;
  };

  type BaseResponsePublicizeWxPlatformVO = {
    code?: number;
    data?: PublicizeWxPlatformVO;
    message?: string;
  };

  type BaseResponseString = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseTaskCheckin = {
    code?: number;
    data?: TaskCheckin;
    message?: string;
  };

  type BaseResponseTaskCheckinVO = {
    code?: number;
    data?: TaskCheckinVO;
    message?: string;
  };

  type BaseResponseTaskDisposal = {
    code?: number;
    data?: TaskDisposal;
    message?: string;
  };

  type BaseResponseTaskDisposalVO = {
    code?: number;
    data?: TaskDisposalVO;
    message?: string;
  };

  type BaseResponseTaskInspection = {
    code?: number;
    data?: TaskInspection;
    message?: string;
  };

  type BaseResponseTaskInspectionVO = {
    code?: number;
    data?: TaskInspectionVO;
    message?: string;
  };

  type BaseResponseTaskTrackVO = {
    code?: number;
    data?: TaskTrackVO;
    message?: string;
  };

  type BaseResponseUser = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseUserVO = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type DeleteRequest = {
    id?: string
  };

  type getAttractionsRouteVOByIdParams = {
    id: number;
  };

  type getAttractionsVOByIdParams = {
    id: number;
  };

  type getDisastersVOByIdParams = {
    id: number;
  };

  type getPublicizeVideoVOByIdParams = {
    id: number;
  };

  type getPublicizeWxPlatformVOByIdParams = {
    id: number;
  };

  type getTaskCheckinByIdParams = {
    id: number;
  };

  type getTaskCheckinVOByIdParams = {
    id: number;
  };

  type getTaskDisposalByIdParams = {
    id: number;
  };

  type getTaskDisposalVOByIdParams = {
    id: number;
  };

  type getTaskInspectionByIdParams = {
    id: number;
  };

  type getTaskInspectionVOByIdParams = {
    id: number;
  };

  type getTaskTrackDetailParams = {
    trackId: number;
  };

  type getUserByIdParams = {
    id: number;
  };

  type getUserVOByIdParams = {
    id: number;
  };

  type getWeatherVOByIdParams = {
    id: number;
  };

  type LoginUserVO = {
    id?: string
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userPhone?: string;
    userEmail?: string;
    userRole?: string;
    createTime?: string;
    updateTime?: string;
    token?: string;
  };

  type NaturalDisastersAddRequest = {
    disastersStartTime?: string;
    disastersEndTime?: string;
    disastersTitle?: string;
    disastersSeverity?: string;
    disastersText?: string;
  };

  type NaturalDisastersQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    notId?: string;
    disastersStartTime?: string;
    disastersEndTime?: string;
    disastersTitle?: string;
    disastersSeverity?: string;
    disastersText?: string;
  };

  type NaturalDisastersUpdateRequest = {
    id?: string
    disastersStartTime?: string;
    disastersEndTime?: string;
    disastersTitle?: string;
    disastersSeverity?: string;
    disastersText?: string;
  };

  type NaturalDisastersVO = {
    id?: string
    disastersStartTime?: string;
    disastersEndTime?: string;
    disastersTitle?: string;
    disastersSeverity?: string;
    disastersText?: string;
  };

  type NaturalWeatherAddRequest = {
    weatherTime?: string;
    temp?: number;
    humidity?: number;
    pressure?: number;
    windSpeed?: number;
    windDeg?: number;
    rain?: number;
  };

  type NaturalWeatherQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    weatherTime?: string;
    notId?: string;
    tempMin?: number;
    tempMax?: number;
    humidityMin?: number;
    humidityMax?: number;
    pressureMin?: number;
    pressureMax?: number;
    windSpeedMin?: number;
    windSpeedMax?: number;
    windDegMin?: number;
    windDegMax?: number;
    rainMin?: number;
    rainMax?: number;
  };

  type NaturalWeatherUpdateRequest = {
    id?: string
    weatherTime?: string;
    temp?: number;
    humidity?: number;
    pressure?: number;
    windSpeed?: number;
    windDeg?: number;
    rain?: number;
  };

  type NaturalWeatherVO = {
    id?: string
    weatherTime?: string;
    temp?: number;
    humidity?: number;
    pressure?: number;
    windSpeed?: number;
    windDeg?: number;
    rain?: number;
  };

  type OrderItem = {
    column?: string;
    asc?: boolean;
  };

  type PageAttractions = {
    records?: Attractions[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageAttractions;
    searchCount?: PageAttractions;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageAttractionsRoute = {
    records?: AttractionsRoute[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageAttractionsRoute;
    searchCount?: PageAttractionsRoute;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageAttractionsRouteVO = {
    records?: AttractionsRouteVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageAttractionsRouteVO;
    searchCount?: PageAttractionsRouteVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageAttractionsVO = {
    records?: AttractionsVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageAttractionsVO;
    searchCount?: PageAttractionsVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageNaturalDisastersVO = {
    records?: NaturalDisastersVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageNaturalDisastersVO;
    searchCount?: PageNaturalDisastersVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageNaturalWeatherVO = {
    records?: NaturalWeatherVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageNaturalWeatherVO;
    searchCount?: PageNaturalWeatherVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PagePublicizeVideo = {
    records?: PublicizeVideo[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PagePublicizeVideo;
    searchCount?: PagePublicizeVideo;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PagePublicizeVideoVO = {
    records?: PublicizeVideoVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PagePublicizeVideoVO;
    searchCount?: PagePublicizeVideoVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PagePublicizeWxPlatform = {
    records?: PublicizeWxPlatform[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PagePublicizeWxPlatform;
    searchCount?: PagePublicizeWxPlatform;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PagePublicizeWxPlatformVO = {
    records?: PublicizeWxPlatformVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PagePublicizeWxPlatformVO;
    searchCount?: PagePublicizeWxPlatformVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageTaskCheckinVO = {
    records?: TaskCheckinVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageTaskCheckinVO;
    searchCount?: PageTaskCheckinVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageTaskDisposalVO = {
    records?: TaskDisposalVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageTaskDisposalVO;
    searchCount?: PageTaskDisposalVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageTaskInspectionVO = {
    records?: TaskInspectionVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageTaskInspectionVO;
    searchCount?: PageTaskInspectionVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageTaskTrackVO = {
    records?: TaskTrackVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageTaskTrackVO;
    searchCount?: PageTaskTrackVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageUser = {
    records?: User[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageUser;
    searchCount?: PageUser;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageUserVO = {
    records?: UserVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageUserVO;
    searchCount?: PageUserVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PublicizeVideo = {
    id?: string
    videoTitle?: string;
    videoUrl?: string;
    videoNote?: string;
    userId?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type PublicizeVideoAddRequest = {
    videoTitle?: string;
    videoUrl?: string;
    videoNote?: string;
  };

  type PublicizeVideoQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    notId?: string;
    searchText?: string;
    videoTitle?: string;
    videoUrl?: string;
    videoNote?: string;
    userId?: string;
  };

  type PublicizeVideoUpdateRequest = {
    id?: string
    videoTitle?: string;
    videoUrl?: string;
    videoNote?: string;
  };

  type PublicizeVideoVO = {
    id?: string
    videoTitle?: string;
    videoUrl?: string;
    videoNote?: string;
    userId?: string;
    createTime?: string;
    updateTime?: string;
    user?: UserVO;
  };

  type PublicizeWxPlatform = {
    id?: string
    wxTitle?: string;
    wxUrl?: string;
    wxNote?: string;
    userId?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type PublicizeWxPlatformAddRequest = {
    wxTitle?: string;
    wxUrl?: string;
    wxNote?: string;
  };

  type PublicizeWxPlatformQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    notId?: string;
    searchText?: string;
    wxTitle?: string;
    wxUrl?: string;
    wxNote?: string;
    userId?: string;
  };

  type PublicizeWxPlatformUpdateRequest = {
    id?: string
    wxTitle?: string;
    wxUrl?: string;
    wxNote?: string;
  };

  type PublicizeWxPlatformVO = {
    id?: string
    wxTitle?: string;
    wxUrl?: string;
    wxNote?: string;
    userId?: string;
    createTime?: string;
    updateTime?: string;
    user?: UserVO;
  };

  type TaskCheckin = {
    id?: string
    checkinLng?: number;
    checkinLat?: number;
    checkinAddress?: string;
    userId?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type TaskCheckinAddRequest = {
    checkinLng?: number;
    checkinLat?: number;
    checkinAddress?: string;
  };

  type TaskCheckinQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    userId?: string;
    checkinAddress?: string;
    startTime?: string;
    endTime?: string;
  };

  type TaskCheckinUpdateRequest = {
    id?: string
    checkinLng?: number;
    checkinLat?: number;
    checkinAddress?: string;
  };

  type TaskCheckinVO = {
    id?: string
    checkinLng?: number;
    checkinLat?: number;
    checkinAddress?: string;
    userId?: string;
    userName?: string;
    createTime?: string;
    updateTime?: string;
  };

  type TaskDisposal = {
    id?: string
    inspectionTaskId?: string;
    disposerId?: string;
    disposalImages?: string;
    disposalDescription?: string;
    disposalStatus?: number;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type TaskDisposalAddRequest = {
    inspectionTaskId?: string;
    disposerId?: string;
    disposalImages?: string;
    disposalDescription?: string;
    disposalStatus?: number;
  };

  type TaskDisposalQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    inspectionTaskId?: string;
    disposerId?: string;
    taskDate?: string;
    attractionsName?: string;
    disposalStatus?: number;
  };

  type TaskDisposalUpdateRequest = {
    id?: string
    disposalImages?: string;
    disposalDescription?: string;
    disposalStatus?: number;
  };

  type TaskDisposalVO = {
    id?: string
    inspectionTaskId?: string;
    disposerId?: string;
    disposerName?: string;
    attractionsName?: string;
    taskDate?: string;
    disposalImages?: string;
    disposalDescription?: string;
    disposalStatus?: number;
    createTime?: string;
    updateTime?: string;
  };

  type TaskInspection = {
    id?: string
    attractionsId?: string;
    inspectorId?: string;
    taskDate?: string;
    inspectionImages?: string;
    inspectionDescription?: string;
    isAbnormal?: number;
    taskStatus?: number;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type TaskInspectionAddRequest = {
    attractionsId?: string;
    inspectorId?: string;
    taskDate?: string;
    inspectionImages?: string;
    inspectionDescription?: string;
    isAbnormal?: number;
  };

  type TaskInspectionQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    attractionsId?: string;
    inspectorId?: string;
    taskDate?: string;
    isAbnormal?: number;
    taskStatus?: number;
  };

  type TaskInspectionUpdateRequest = {
    id?: string
    inspectionImages?: string;
    inspectionDescription?: string;
    isAbnormal?: number;
    taskStatus?: number;
  };

  type TaskInspectionVO = {
    id?: string
    attractionsId?: string;
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    inspectorId?: string;
    inspectorName?: string;
    taskDate?: string;
    inspectionImages?: string;
    inspectionDescription?: string;
    isAbnormal?: number;
    taskStatus?: number;
    createTime?: string;
    updateTime?: string;
  };

  type TaskTrackEndRequest = {
    trackId?: string;
  };

  type TaskTrackPoint = {
    id?: string
    trackId?: string;
    trackLat?: number;
    trackLng?: number;
    trackTimestamp?: number;
    createTime?: string;
  };

  type TaskTrackPointAddRequest = {
    trackId?: string;
    trackLat?: number;
    trackLng?: number;
    trackTimestamp?: number;
  };

  type TaskTrackQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    userId?: string;
    trackStatus?: number;
    startTimeBegin?: string;
    startTimeEnd?: string;
  };

  type TaskTrackStartRequest = true;

  type TaskTrackVO = {
    id?: string
    trackStartTime?: string;
    trackEndTime?: string;
    trackStatus?: number;
    userId?: string;
    userName?: string;
    userAccount?: string;
    createTime?: string;
    updateTime?: string;
    trackPoints?: TaskTrackPoint[];
  };

  type User = {
    id?: string
    userAccount?: string;
    userPassword?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userPhone?: string;
    userEmail?: string;
    userRole?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type UserAddRequest = {
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userPassword?: string;
    userProfile?: string;
    userPhone?: string;
    userEmail?: string;
    userRole?: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: string
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userProfile?: string;
    userPhone?: string;
    userEmail?: string;
    userRole?: string;
  };

  type UserRegisterRequest = {
    userAccount?: string;
    userPassword?: string;
    checkPassword?: string;
  };

  type UserUpdateMyRequest = {
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userPassword?: string;
    userPhone?: string;
    userEmail?: string;
  };

  type UserUpdateRequest = {
    id?: string
    userName?: string;
    userAccount?: string;
    userPassword?: string;
    userAvatar?: string;
    userProfile?: string;
    userPhone?: string;
    userEmail?: string;
    userRole?: string;
  };

  type UserVO = {
    id?: string
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userPhone?: string;
    userEmail?: string;
    userRole?: string;
    createTime?: string;
  };
}
