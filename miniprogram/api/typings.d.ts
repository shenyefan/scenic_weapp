declare namespace API {
  type Attractions = {
    id?: number;
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    attractionsImg?: string;
    attractionsVideo?: string;
    attractionsNote?: string;
    inspectorId?: number;
    userId?: number;
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
    inspectorId?: number;
  };

  type AttractionsQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    notId?: number;
    searchText?: string;
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    attractionsNote?: string;
    attractionsTypeIds?: number[];
    inspectorId?: number;
    userId?: number;
  };

  type AttractionsRoute = {
    id?: number;
    startAttractionId?: number;
    endAttractionId?: number;
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
    startAttractionId?: number;
    endAttractionId?: number;
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
    id?: number;
    notId?: number;
    searchText?: string;
    startAttractionId?: number;
    endAttractionId?: number;
    routeNote?: string;
  };

  type AttractionsRouteUpdateRequest = {
    id?: number;
    startAttractionId?: number;
    endAttractionId?: number;
    startAttractionImg?: string;
    endAttractionImg?: string;
    startAttractionVideo?: string;
    endAttractionVideo?: string;
    routeNote?: string;
  };

  type AttractionsRouteVO = {
    id?: number;
    startAttractionId?: number;
    endAttractionId?: number;
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
    id?: number;
    typeName?: string;
    typeDescription?: string;
  };

  type AttractionsTypeVO = {
    id?: number;
    typeName?: string;
    typeDescription?: string;
    createTime?: string;
    updateTime?: string;
  };

  type AttractionsUpdateRequest = {
    id?: number;
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    attractionsImg?: string;
    attractionsVideo?: string;
    attractionsNote?: string;
    attractionsTypeIds?: number[];
    inspectorId?: number;
  };

  type AttractionsVO = {
    id?: number;
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    attractionsImg?: string;
    attractionsVideo?: string;
    attractionsNote?: string;
    attractionsTypes?: AttractionsTypeVO[];
    inspectorId?: number;
    inspectorName?: string;
    userId?: number;
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

  type BaseResponsePageAttractionsTypeVO = {
    code?: number;
    data?: PageAttractionsTypeVO;
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
    id?: number;
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

  type listAttractionsTypeByPageParams = {
    current?: number;
    size?: number;
  };

  type LoginUserVO = {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
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
    id?: number;
    notId?: number;
    disastersStartTime?: string;
    disastersEndTime?: string;
    disastersTitle?: string;
    disastersSeverity?: string;
    disastersText?: string;
  };

  type NaturalDisastersUpdateRequest = {
    id?: number;
    disastersStartTime?: string;
    disastersEndTime?: string;
    disastersTitle?: string;
    disastersSeverity?: string;
    disastersText?: string;
  };

  type NaturalDisastersVO = {
    id?: number;
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
    id?: number;
    weatherTime?: string;
    notId?: number;
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
    id?: number;
    weatherTime?: string;
    temp?: number;
    humidity?: number;
    pressure?: number;
    windSpeed?: number;
    windDeg?: number;
    rain?: number;
  };

  type NaturalWeatherVO = {
    id?: number;
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

  type PageAttractionsTypeVO = {
    records?: AttractionsTypeVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageAttractionsTypeVO;
    searchCount?: PageAttractionsTypeVO;
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
    id?: number;
    videoTitle?: string;
    videoUrl?: string;
    videoNote?: string;
    userId?: number;
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
    id?: number;
    notId?: number;
    searchText?: string;
    videoTitle?: string;
    videoUrl?: string;
    videoNote?: string;
    userId?: number;
  };

  type PublicizeVideoUpdateRequest = {
    id?: number;
    videoTitle?: string;
    videoUrl?: string;
    videoNote?: string;
  };

  type PublicizeVideoVO = {
    id?: number;
    videoTitle?: string;
    videoUrl?: string;
    videoNote?: string;
    userId?: number;
    createTime?: string;
    updateTime?: string;
    user?: UserVO;
  };

  type PublicizeWxPlatform = {
    id?: number;
    wxTitle?: string;
    wxUrl?: string;
    wxNote?: string;
    userId?: number;
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
    id?: number;
    notId?: number;
    searchText?: string;
    wxTitle?: string;
    wxUrl?: string;
    wxNote?: string;
    userId?: number;
  };

  type PublicizeWxPlatformUpdateRequest = {
    id?: number;
    wxTitle?: string;
    wxUrl?: string;
    wxNote?: string;
  };

  type PublicizeWxPlatformVO = {
    id?: number;
    wxTitle?: string;
    wxUrl?: string;
    wxNote?: string;
    userId?: number;
    createTime?: string;
    updateTime?: string;
    user?: UserVO;
  };

  type TaskCheckin = {
    id?: number;
    checkinLng?: number;
    checkinLat?: number;
    checkinAddress?: string;
    userId?: number;
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
    id?: number;
    userId?: number;
    checkinAddress?: string;
    startTime?: string;
    endTime?: string;
  };

  type TaskCheckinUpdateRequest = {
    id?: number;
    checkinLng?: number;
    checkinLat?: number;
    checkinAddress?: string;
  };

  type TaskCheckinVO = {
    id?: number;
    checkinLng?: number;
    checkinLat?: number;
    checkinAddress?: string;
    userId?: number;
    userName?: string;
    createTime?: string;
    updateTime?: string;
  };

  type TaskDisposal = {
    id?: number;
    inspectionTaskId?: number;
    disposerId?: number;
    disposalImages?: string;
    disposalDescription?: string;
    disposalStatus?: number;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type TaskDisposalAddRequest = {
    inspectionTaskId?: number;
    disposerId?: number;
    disposalImages?: string;
    disposalDescription?: string;
    disposalStatus?: number;
  };

  type TaskDisposalQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    inspectionTaskId?: number;
    disposerId?: number;
    taskDate?: string;
    attractionsName?: string;
    disposalStatus?: number;
  };

  type TaskDisposalUpdateRequest = {
    id?: number;
    disposalImages?: string;
    disposalDescription?: string;
    disposalStatus?: number;
  };

  type TaskDisposalVO = {
    id?: number;
    inspectionTaskId?: number;
    disposerId?: number;
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
    id?: number;
    attractionsId?: number;
    inspectorId?: number;
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
    attractionsId?: number;
    inspectorId?: number;
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
    id?: number;
    attractionsId?: number;
    inspectorId?: number;
    taskDate?: string;
    isAbnormal?: number;
    taskStatus?: number;
  };

  type TaskInspectionUpdateRequest = {
    id?: number;
    inspectionImages?: string;
    inspectionDescription?: string;
    isAbnormal?: number;
    taskStatus?: number;
  };

  type TaskInspectionVO = {
    id?: number;
    attractionsId?: number;
    attractionsName?: string;
    attractionsLng?: number;
    attractionsLat?: number;
    inspectorId?: number;
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
    trackId?: number;
  };

  type TaskTrackPoint = {
    id?: number;
    trackId?: number;
    trackLat?: number;
    trackLng?: number;
    trackTimestamp?: number;
    createTime?: string;
  };

  type TaskTrackPointAddRequest = {
    trackId?: number;
    trackLat?: number;
    trackLng?: number;
    trackTimestamp?: number;
  };

  type TaskTrackQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    userId?: number;
    trackStatus?: number;
    startTimeBegin?: string;
    startTimeEnd?: string;
  };

  type TaskTrackStartRequest = true;

  type TaskTrackVO = {
    id?: number;
    trackStartTime?: string;
    trackEndTime?: string;
    trackStatus?: number;
    userId?: number;
    userName?: string;
    userAccount?: string;
    createTime?: string;
    updateTime?: string;
    trackPoints?: TaskTrackPoint[];
  };

  type User = {
    id?: number;
    userAccount?: string;
    userPassword?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
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
    userRole?: string;
    userProfile?: string;
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
    id?: number;
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userProfile?: string;
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
  };

  type UserUpdateRequest = {
    id?: number;
    userName?: string;
    userAccount?: string;
    userPassword?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserVO = {
    id?: number;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
  };
}
