// Action types
export const TRIP_PLANNING_ON = 'TRIP_PLANNING_ON';
export const TRIP_PLANNING_OFF = 'TRIP_PLANNING_OFF';
export const TOGGLE_CURBRAMPS = 'TOGGLE_CURBRAMPS';
export const SET_INCLINE_MAX = 'SET_INCLINE_MAX';
export const SET_INCLINE_MIN = 'SET_INCLINE_MIN';
export const SET_INCLINE_IDEAL = 'SET_INCLINE_IDEAL';

export const REQUEST_ROUTE = 'REQUEST_ROUTE';
export const RECEIVE_ROUTE = 'RECEIVE_ROUTE';
export const FAILED_ROUTE = 'FAILED_ROUTE';

export const SET_ORIGIN = 'SET_ORIGIN';
export const SET_DESTINATION = 'SET_DESTINATION';
export const SET_ORIGIN_DESTINATION = 'SET_ORIGIN_DESTINATION';
export const SET_POI = 'SET_POI';
export const LOG_BOUNDS = 'LOG_BOUNDS';
export const SWAP_WAYPOINTS = 'SWAP_WAYPOINTS';
export const CLEAR_GEOLOCATION = 'CLEAR_GEOLOCATION';
export const REQUEST_GEOLOCATION = 'REQUEST_GEOLOCATION';
export const RECEIVE_GEOLOCATION = 'RECEIVE_GEOLOCATION';
export const NO_GEOLOCATION = 'NO_GEOLOCATION';

export const SET_CENTER = 'SET_CENTER';
export const SET_ZOOM = 'SET_ZOOM';
export const SET_CENTER_AND_ZOOM = 'SET_CENTER_AND_ZOOM';
export const MAP_MOVE = 'MAP_MOVE';

export const MAP_CLICK = 'MAP_CLICK';

// Action creators
export function tripPlanningOn(poi) {
  return {
    type: TRIP_PLANNING_ON,
    payload: poi
  };
}

export function tripPlanningOff(destination) {
  return {
    type: TRIP_PLANNING_OFF,
    payload: destination
  };
}

export function requestRoute(origin, destination, params) {
  return {
    type: REQUEST_ROUTE,
    payload: {
      origin,
      destination,
      params
    }
  };
}

export function receiveRoute(routeResult) {
  return {
    type: RECEIVE_ROUTE,
    payload: routeResult
  };
}

export function failedRoute(origin, destination, error) {
  return {
    type: FAILED_ROUTE,
    payload: {
      origin,
      destination,
      error
    }
  };
}

export function fetchRoute(origin, destination, params) {
  return (dispatch) => {
    dispatch(requestRoute(origin, destination, params));

    const {
      inclineMax,
      inclineMin,
      inclineIdeal,
      requireCurbRamps
    } = params;

    const routeParams = {
      origin: origin.geometry.coordinates.slice().reverse().join(','),
      destination: destination
                     .geometry
                     .coordinates
                     .slice()
                     .reverse()
                     .join(','),
      maxup: inclineMax,
      maxdown: inclineMin,
      ideal: inclineIdeal,
    };
    if (requireCurbRamps) routeParams.avoid = 'curbs';

    const esc = encodeURIComponent;
    const urlQuery = Object.keys(routeParams)
      .map(k => `${esc(k)}=${esc(routeParams[k])}`)
      .join('&');

    const query = `${window.location.origin}/api/v2/route.json?${urlQuery}`;

    fetch(query)
      .then(
        response => response.json(),
        error => dispatch(failedRoute, origin, destination, error)
      )
      .then(json => dispatch(receiveRoute(json)));
  };
}

function routeIfValid(dispatch, getState) {
  const {
    origin,
    destination
  } = getState().waypoints;

  const {
    planningTrip,
    inclineMax,
    inclineMin,
    inclineIdeal,
    requireCurbRamps
  } = getState().tripplanning;

  if (planningTrip && origin !== null && destination !== null) {
    dispatch(fetchRoute(
      origin,
      destination,
      { inclineMax, inclineMin, inclineIdeal, requireCurbRamps }
    ));
  }
}

export function toggleCurbRamps() {
  return (dispatch, getState) => {
    dispatch({
      type: TOGGLE_CURBRAMPS
    });
    routeIfValid(dispatch, getState);
  };
}

export function setInclineMax(value) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_INCLINE_MAX,
      payload: value
    });
    routeIfValid(dispatch, getState);
  };
}

export function setInclineMin(value) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_INCLINE_MIN,
      payload: value
    });
    routeIfValid(dispatch, getState);
  };
}

export function setInclineIdeal(value) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_INCLINE_IDEAL,
      payload: value
    });
    routeIfValid(dispatch, getState);
  };
}

export function setOrigin(origin) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_ORIGIN,
      payload: origin
    });
    routeIfValid(dispatch, getState);
  };
}

export function setDestination(destination) {
  return (dispatch, getState) => {
    dispatch({
      type: SET_DESTINATION,
      payload: destination
    });
    routeIfValid(dispatch, getState);
  };
}

export function setPOI(poi) {
  return {
    type: SET_POI,
    payload: poi
  };
}

export function logBounds(bounds) {
  return {
    type: LOG_BOUNDS,
    payload: bounds
  };
}

export function setOriginDestination(origin, destination) {
  return {
    type: SET_ORIGIN_DESTINATION,
    payload: {
      origin,
      destination
    }
  };
}

export function swapWaypoints(origin, destination) {
  return (dispatch, getState) => {
    dispatch({
      type: SWAP_WAYPOINTS,
      payload: {
        origin,
        destination
      }
    });
    routeIfValid(dispatch, getState);
  };
}

export function setCenter(center) {
  return {
    type: SET_CENTER,
    payload: center
  };
}

export function setZoom(zoom) {
  return {
    type: SET_ZOOM,
    payload: zoom
  };
}

export function setCenterAndZoom(center, zoom) {
  // Useful for when you want to set both: if you just used setCenter and
  // setZoom, you can get race conditions due to the map also updating state
  // when it's finished zooming/moving
  return {
    type: SET_CENTER_AND_ZOOM,
    payload: {
      center,
      zoom
    }
  };
}

export function mapMove(center, zoom, bounds) {
  return {
    type: MAP_MOVE,
    payload: {
      center,
      zoom,
      bounds
    }
  };
}

export function mapClick(features) {
  return {
    type: MAP_CLICK,
    payload: features
  };
}

export function toggleGeolocation() {
  return (dispatch, getState) => {
    const { geolocation } = getState().geolocation;
    if (geolocation && geolocation.status === 'Ok') {
      dispatch({ type: 'CLEAR_GEOLOCATION' });
      return;
    }

    if ('geolocation' in navigator) {
      // Try to get the geolocation
      dispatch({ type: 'REQUEST_GEOLOCATION' });
      navigator.geolocation.getCurrentPosition((position) => {
        const coordinates = [
          position.coords.longitude,
          position.coords.latitude
        ];
        dispatch({
          type: 'RECEIVE_GEOLOCATION',
          payload: {
            coordinates,
            accuracy: position.coords.accuracy
          }
        });
      });
    } else {
      // Fail
      dispatch({ type: 'NO_GEOLOCATION' });
    }
  };
}