export const constants = {
  socketUrl: 'http://localhost:3000',
  // socketUrl: 'https://clubhouse-clone-server.herokuapp.com/',
  socketNamespaces: {
    room: 'room',
    lobby: 'lobby'
  },
  peerConfig: Object.values({
    id: undefined,
    config: {
      // host: 'clubhouse-clone-peerjs-server.herokuapp.com',
      // secure: true,
      // path: '/'
      port: 9000,
      host: 'localhost',
      path: '/ '
    }
  }),
  pages: {
    lobby: '/pages/lobby',
    login: '/pages/login'
  },
  events: {
    USER_CONNECTED: 'userConnection',
    USER_DISCONNECTED: 'userDisconnection',
    JOIN_ROOM: 'joinRoom',
    LOBBY_UPDATED: 'lobbyUpdated',
    UPGRADE_USER_PERMISSION: 'upgradeUserPermission',
    SPEAK_REQUEST: 'speakRequest',
    SPEAK_ANSWER: 'speakAnswer'
  },
  firebaseConfig: {
    apiKey: "AIzaSyCm_CHKVKlT8WMtf-EoJm-Rir81YLRZ-cA",
    authDomain: "clone-clubhouse-547ce.firebaseapp.com",
    projectId: "clone-clubhouse-547ce",
    storageBucket: "clone-clubhouse-547ce.appspot.com",
    messagingSenderId: "570640507374",
    appId: "1:570640507374:web:30914991aedf4ca8122eff",
    measurementId: "G-4ZVY6M2R54"
  },
  storageKey: 'jsexpert:storage:user'
}