import React from 'react'
import { Text, View, Image, StatusBar, Animated, ViewPropTypes } from 'react-native'
import { arrayOf, bool, number, shape, string, func, oneOfType, object } from 'prop-types'
import StickyParallaxHeader from '../../index'
import { constants, colors, sizes } from '../../constants'
import styles from './TabbedHeader.styles'
import RenderContent from './defaultProps/defaultProps'
import isUndefined from 'lodash/isUndefined'

const { event, ValueXY } = Animated
export default class TabbedHeader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      contentHeight: {},
      headerLayout: {
        height: 0
      }
    }
    this.scrollY = new ValueXY()
  }

  componentDidMount() {
    // eslint-disable-next-line
    this.scrollY.y.addListener(({ value }) => (this._value = value))
  }

  componentWillUnmount() {
    this.scrollY.y.removeListener()
  }

  setHeaderSize = (headerLayout) => this.setState({ headerLayout })

  scrollPosition = (value) => {
    const { headerLayout } = this.state

    return constants.scrollPosition(headerLayout.height, value)
  }

  renderHeader = () => {
    const {
      backgroundColor,
      logo,
      logoResizeMode,
      logoStyle,
      logoContainerStyle,
      header
    } = this.props

    const renderLogoHeader = () => (
      <View style={[logoContainerStyle, { backgroundColor }]}>
        <Image
          resizeMode={logoResizeMode}
          source={logo}
          style={logoStyle}
        />
      </View>
    )

    const renderHeader = header ? header : renderLogoHeader
    return renderHeader()
  }

  renderForeground = (scrollY) => {
    const { title, titleStyle, foregroundImage } = this.props
    const messageStyle = titleStyle || styles.message
    const startSize = constants.responsiveWidth(18)
    const endSize = constants.responsiveWidth(10)
    const [startImgFade, finishImgFade] = [this.scrollPosition(22), this.scrollPosition(27)]
    const [startImgSize, finishImgSize] = [this.scrollPosition(20), this.scrollPosition(30)]
    const [startTitleFade, finishTitleFade] = [this.scrollPosition(25), this.scrollPosition(45)]

    const imageOpacity = scrollY.y.interpolate({
      inputRange: [0, startImgFade, finishImgFade],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp'
    })
    const imageSize = scrollY.y.interpolate({
      inputRange: [0, startImgSize, finishImgSize],
      outputRange: [startSize, startSize, endSize],
      extrapolate: 'clamp'
    })
    const titleOpacity = scrollY.y.interpolate({
      inputRange: [0, startTitleFade, finishTitleFade],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp'
    })

    const renderImage = () => {
      const logo = isUndefined(foregroundImage)
      ? require('../../assets/images/photosPortraitMe.png')
      : foregroundImage

      if(foregroundImage !== null){
        return (
          <Animated.View style={{ opacity: imageOpacity }}>
            <Animated.Image
              source={logo}
              style={[styles.profilePic, { width: imageSize, height: imageSize }]}
            />
          </Animated.View>
        )
      }
    }

    return (
      <View style={styles.foreground}>
        {renderImage()}
        <Animated.View style={[styles.messageContainer, { opacity: titleOpacity }]}>
          <Text style={messageStyle}>{title}</Text>
        </Animated.View>
      </View>
    )
  }

  onLayoutContent = (e, title) => {
    const { contentHeight } = this.state
    const contentHeightTmp = { ...contentHeight }
    contentHeightTmp[title] = e.nativeEvent.layout.height

    this.setState({
      contentHeight: { ...contentHeightTmp }
    })
  }

  calcMargin = (title) => {
    const { contentHeight } = this.state
    let marginBottom = 50

    if (contentHeight[title]) {
      const padding = 24
      const isBigContent = constants.deviceHeight - contentHeight[title] < 0

      if (isBigContent) {
        return marginBottom
      }

      marginBottom = constants.deviceHeight - padding * 2 - sizes.headerHeight - contentHeight[title]

      return marginBottom
    }

    return marginBottom
  }

  render() {
    const {
      tabs,
      headerHeight,
      backgroundColor,
      backgroundImage,
      bounces,
      snapToEdge,
      scrollEvent,
      renderBody,
      tabText,
      tabTextActiveStyle,
      tabTextContainerStyle,
      tabTextContainerActiveStyle
    } = this.props

    return (
      <React.Fragment>
        <StatusBar barStyle="light-content" backgroundColor={backgroundColor} translucent />
        <StickyParallaxHeader
          foreground={this.renderForeground(this.scrollY)}
          header={this.renderHeader()}
          deviceWidth={constants.deviceWidth}
          parallaxHeight={sizes.homeScreenParallaxHeader}
          scrollEvent={event([{ nativeEvent: { contentOffset: { y: this.scrollY.y } } }], {useNativeDriver: false, listener: e => scrollEvent && scrollEvent(e)})}
          headerSize={this.setHeaderSize}
          headerHeight={headerHeight}
          tabs={tabs}
          tabTextStyle={tabText}
          tabTextActiveStyle={tabTextActiveStyle}
          tabTextContainerStyle={tabTextContainerStyle}
          tabTextContainerActiveStyle={tabTextContainerActiveStyle}
          tabsContainerBackgroundColor={backgroundColor}
          tabsWrapperStyle={styles.tabsWrapper}
          backgroundImage={backgroundImage}
          bounces={bounces}
          snapToEdge={snapToEdge}
        >
          {renderBody('Popular Quizes')}
        </StickyParallaxHeader>
      </React.Fragment>
    )
  }
}

TabbedHeader.propTypes = {
  backgroundColor: string,
  headerHeight: number,
  backgroundImage: oneOfType([object, number]),
  title: string,
  bounces: bool,
  snapToEdge: bool,
  tabs: arrayOf(shape({})),
  renderBody: func,
  logo: number,
  logoResizeMode: string,
  logoStyle: ViewPropTypes.style,
  logoContainerStyle: ViewPropTypes.style,
  tabText: Text.propTypes.style,
  tabTextActiveStyle: Text.propTypes.style,
  tabTextContainerStyle: ViewPropTypes.style,
  tabTextContainerActiveStyle: ViewPropTypes.style,
  scrollEvent: func
}

TabbedHeader.defaultProps = {
  backgroundColor: colors.primaryGreen,
  headerHeight: sizes.headerHeight,
  backgroundImage: null,
  title: "Mornin' Mark! \nReady for a quiz?",
  bounces: true,
  snapToEdge: true,
  logo: require('../../assets/images/logo.png'),
  logoResizeMode: "contain",
  logoStyle: styles.logo,
  logoContainerStyle: styles.headerWrapper,
  renderBody: title => <RenderContent title={title} />,
  tabs: [
    {
      title: 'Popular',
      content: <RenderContent title="Popular Quizes" />
    },
    {
      title: 'Product Design',
      content: <RenderContent title="Product Design" />
    },
    {
      title: 'Development',
      content: <RenderContent title="Development" />
    },
    {
      title: 'Project Management',
      content: <RenderContent title="Project Management" />
    }
  ],
  tabText: styles.tabText,
  tabTextActiveStyle: styles.tabText,
  tabTextContainerStyle: styles.tabTextContainerStyle,
  tabTextContainerActiveStyle: styles.tabTextContainerActiveStyle
}
