import PropTypes from 'prop-types';

export const pointFeatureNoProps = PropTypes.shape({
  geometry: PropTypes.shape({
    type: PropTypes.oneOf(['Point']),
    coordinates: PropTypes.arrayOf(PropTypes.number)
  }),
  type: PropTypes.oneOf(['Feature'])
});

export const lineGeometry = PropTypes.shape({
  type: PropTypes.oneOf(['LineString']),
  coordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
});

export const accessMapSegment = PropTypes.shape({
  type: PropTypes.oneOf(['Feature']),
  geometry: lineGeometry,
  properties: PropTypes.shape({
    construction: PropTypes.bool,
    cost: PropTypes.number,
    grade: PropTypes.number
  })
});

export const routeResult = PropTypes.shape({
  code: PropTypes.oneOf(['Ok', 'Error']),
  origin: pointFeatureNoProps,
  destination: pointFeatureNoProps,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      geometry: lineGeometry,
      segments: PropTypes.shape({
        type: PropTypes.oneOf(['FeatureCollection']),
        features: PropTypes.arrayOf(accessMapSegment)
      })
    })
  ),
  waypoints: PropTypes.arrayOf(pointFeatureNoProps)
});
