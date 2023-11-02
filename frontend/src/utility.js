import axios from 'axios'
import moment from 'moment'

const isExternal = url => url && (url.indexOf(':') > -1 || url.indexOf('//') > -1 || url.indexOf('www.') > -1)
const isBlocked = (state, id) => state.blocked.includes(id) || state.blockedBy.includes(id)

const getDate = item => {
  if (!item) return new Date()
  switch (item.type) {
    case 'visitor':
      return item.visit_date
    case 'visited':
      return item.visit_date
    case 'follower':
      return item.match_date
    case 'following':
      return item.match_date
    default:
      return item
  }
} 
const getId = tab => {
  switch (tab) {
    case 'notif':
      return 'id_from'
    case 'convos':
      return 'user_id'
    default:
      return 'id'
  }
}
const getLocationFromIp = async f => {
  try {
    const url = 'https://ipinfo.io?token=3443e12245bdcf'
    const res = await axios.get(url)
    if (!res.error) {
      const splitted = res.data.loc.split(',')
      f({ lat: Number(splitted[0]), lng: Number(splitted[1]) })
    }
  } catch (error) {
    console.error('err getLocationFromIp in frontend/utility.js ===> ', error)
  }
}

const syncLocation = async location => {
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/location`
    const headers = { 'x-auth-token': token }
    await axios.post(url, location, { headers })
  } catch (error) {
    console.error('err syncLocation in frontend/utility.js ===> ', error)
  }
}

const updateOneNotif = async (id_from, id_to) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_APP_API_URL}/api/notif/updateOneNotif`;
    const headers = { 'x-auth-token': token };
    const response = await axios.put(url, { id_from, id_to }, { headers });

    if (response.status === 200) {
      console.log('Notification marked as seen successfully.');
    } else {
      console.error('Failed to mark the notification as seen.');
    }
  } catch (error) {
    console.error('Error in seenOneNotif:', error);
  }
}

const getAllTags = async () => {
  try {
      const url = `${import.meta.env.VITE_APP_API_URL}/allTags`
      const response = await axios.get(url, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      return response.data
  } catch (error) {
    console.error('err getAllTags in frontend/utility.js ===> ', error)
      throw error
  }
}

const getConnectedUsers = async () => {
  try {
      const url = `${import.meta.env.VITE_APP_API_URL}/connectedUsers`
      const response = await axios.get(url, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
      return response.data
  } catch (error) {
    console.error('err getConnectedUsers in frontend/utility.js ===> ', error)
      throw error
  }
}

import dislike from '@/assets/match/dislike.png'
import match from '@/assets/match/match-ok.png'
import confirm from '@/assets/match/match-to-confirm.png'
import receive from '@/assets/match/receive-match.png'
import defaultIcon from '@/assets/match/heart-default.png'



export default {
  getDate,
  isBlocked,
  updateOneNotif,
  getAllTags,
  getConnectedUsers,
  syncLocation,
  getLocationFromIp,
  // eslint-disable-next-line
  getFullPath: (file) => isExternal(file) ? file : `${import.meta.env.VITE_APP_API_URL}/uploads/${file ? file : 'default/defaut_profile.png'}`,
  // consoleLog: ('utility.js getFullPath => ', getFullPath),
  formatTime (date) {
    const when = moment(getDate(date))
    const now = moment()
    let fmt = 'M/DD/YY, h:mm A'
    if (now.diff(when, 'weeks', true) < 1) {
      fmt = 'ddd h:mm A'
    } else if (now.diff(when, 'years', true) < 1) {
      fmt = 'MMMM D, YYYY, h:mm A'
    }
    return when.format(fmt)
  },
  sync: async type => {
    try {
      const token = localStorage.getItem('token')
      const url = `${import.meta.env.VITE_APP_API_URL}/api/${type}`
      const headers = { 'x-auth-token': token }
      const res = await axios.get(url, { headers })
      return res.data.msg ? [] : res.data
    } catch (error) {
    console.error('err sync in frontend/utility.js ===> ', error)
    }
  },
  syncNotif: async () => {
    try {
      const token = localStorage.getItem('token')
      const url = `${import.meta.env.VITE_APP_API_URL}/api/notif/all`
      const headers = { 'x-auth-token': token }
      const result = await axios.get(url, { headers })
      return result.data.msg ? [] : result.data
    } catch (error) {
    console.error('err syncNotif in frontend/utility.js ===> ', error)
    }
  },
  calculateDistance: (from, to, mile) => {
    if (!from || !to) return 10
    const radianConversion = Math.PI / 180
    const earthRadius = 6371
    const fromLat = from.lat * radianConversion
    const fromLng = from.lng * radianConversion
    const toLat = to.lat * radianConversion
    const toLng = to.lng * radianConversion
    const dLat = toLat - fromLat
    const dLng = toLng - fromLng
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(fromLat) * Math.cos(toLat) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    let distance = earthRadius * c
    if (mile) {
      distance *= 0.621371
    }
    return distance
  },
  updateLocation: () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => syncLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }), () => getLocationFromIp(res => syncLocation({
        lat: Number(res.lat),
        lng: Number(res.lng)
      })))
    } else {
      getLocationFromIp(res => syncLocation({
        lat: Number(res.lat),
        lng: Number(res.lng)
      }))
    }
  },

  getHistoryAction (type, first_name, last_name) {

    if (first_name === null) {
      first_name = 'Anonymous';
    }

    if (last_name === null) {
      last_name = 'User';
    }
  
    switch (type) {
      case 'visited':
      case 'you_visit':
        return `You visited the profile of ${first_name} ${last_name}`
      case 'visitor':
      case 'he_visit':
        return `${first_name} ${last_name} visited your profile`
      case 'following':
      case 'you_like':
        return `You liked ${first_name} ${last_name}`
      case 'follower':
      case 'he_like':
        return `${first_name} ${last_name}  liked you`
      case 'you_like_back':
        return `You accepted the like of ${first_name} ${last_name}`
      case 'he_like_back':
        return `${first_name} ${last_name} accepted your like`
      case 'you_unlike':
        return `You unliked ${first_name} ${last_name}`
      case 'he_unlike':
        return `${first_name} ${last_name} unliked you`
      case 'you_block':
        return `You blocked ${first_name} ${last_name}`
      case 'he_block':
        return `${first_name} ${last_name} blocked you`
      case 'talk':
        return `You talked to ${first_name} ${last_name}`
      case 'avatar_img' :
        return 'You changed your avatar'
      case 'cover_img' :
        return 'You changed your cover'
    }
    // "you_visit",
    // "you_like",
    // "you_unlike",
    // "he_visit",
    // "he_like",
    // "you_like_back",
    // "he_like_back",
    // "he_unlike",
    // "talk",
    // "you_block",
    // "he_block",
    // "avatar_img",
    // "cover_img"
  },
  getNotifMsg (notif) {
    switch (notif.type) {
      case 'visit':
        return ' checked your profile'
      case 'like':
        return ' liked you'
      case 'like_back':
        return ' liked you back'
      case 'unlike':
        return ' unliked you'
    }
  },
  fromNow (date) {
    return moment.utc(date).fromNow()
  },

  getNotifIcon (type) {
    switch (type) {
      case 'visit':
      case 'you_visit':
      case 'he_visit':
        return ['mdi', 'mdi-eye', 'text-blue']
      case 'like':
      case 'you_like':
      case 'he_like':
        return ['mdi', 'mdi-heart-pulse', 'text-green']
      case 'like_back':
      case 'you_like_back':
      case 'he_like_back':
        return ['mdi', 'mdi-heart', 'text-red']
      case 'unlike':
      case 'you_unlike':
      case 'he_unlike':
        return ['mdi', 'mdi-heart-broken', 'text-black']
      case 'block':
      case 'you_block':
      case 'he_block':
        return ['mdi', 'mdi-block-helper', 'text-warning']
      case 'talk':
        return ['mdi', 'mdi-wechat', 'text-grey']
      case 'avatar_img':
        return ['mdi', 'mdi-account', 'text-blue']
      case 'cover_img':
        return ['mdi', 'mdi-image', 'text-green']
    }
  },
  getLikeValue (type) {
    switch(type) {
      case 'you_like_back':
      case 'he_like_back':
      case 'you_like':
      case 'he_like':
        return true
      case 'you_unlike':
      case 'he_unlike':
        return false
    }
  },


  getLikeIcon(liked) {
    switch (liked) {
      case 'he_like':
        return `${receive}`
      case 'you_like':
        return `${confirm}`
      case 'you_like_back':
      case 'he_like_back':
        return `${match}`
      case 'he_unlike':
      case 'you_unlike':
        return `${dislike}`
      default:
        return `${defaultIcon}`
    }
  },


  filterBlocked: (state, type) => {
    return state[type].filter(cur => !isBlocked(state, cur[getId(type)]))
  },
  showAlert (color, text) {
    console.log('showAlert color, text => ', color, text)
    return {
      state: true,
      color: color,
      text: text
    }
  },

  passMatch: (p1, p2) => !p1.length || p2 === p1 ? '' : 'Passwords must match'
}