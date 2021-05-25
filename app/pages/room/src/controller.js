import { constants } from "../../_shared/constants.js"
import Attendee from "./entities/attendee.js"

export default class RoomController {
  constructor({ roomInfo, socketBuilder, view, peerBuilder, roomService }) {
    this.socketBuilder = socketBuilder;
    this.roomInfo = roomInfo;
    this.view = view;
    this.peerBuilder = peerBuilder;
    this.roomService = roomService;
    this.socket = {};
  }
  static async initialize(deps) {
    return new RoomController(deps)._initialize();
  }

  async _initialize() {
    this._setupViewEvents();
    this.roomService.init();
    this.socket = this._setupSocket();
    this.roomService.setCurrentPeer(await this._setupWebRTC());
  }

  _setupViewEvents() {
    this.view.configureOnMicrophoneActivation(this.onMicrophoneActivation())
    this.view.configureLeaveButton();
    this.view.configureClapButton(this.onClapPressed());
    this.view.updateUserImage(this.roomInfo.user);
    this.view.updateRoomTopic(this.roomInfo.room);
  }

  onMicrophoneActivation() {
    return async () => {
      await this.roomService.toggleAudioActivation();
    };
  }

  _setupSocket() {
    return this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onDisconnected())
      .setOnRoomUpdated(this.onRoomUpdated())
      .setOnUserProfileUpgrade(this.onUserProfileUpgrade())
      .setOnSpeakRequested(this.onSpeakRequested())
      .build();
  }

  onSpeakRequested() {
    return (data) => {
      const attendee = new Attendee(data);
      const result =  prompt(`${attendee.username} pediu pra falar!\nAceitar? 1 - Sim, 0 - Não`);
      this.socket.emit(constants.events.SPEAK_ANSWER, { answer: !!Number(result), user: attendee });
    };
  }

  async _setupWebRTC() {
    return this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .setOnCallReceived(this.onCallReceived())
      .setOnCallError(this.onCallError())
      .setOnCallClose(this.onCallClose())
      .setOnStreamReceived(this.onStreamReceived())
      .build();
  }

  onClapPressed() {
    return () => {
      this.socket.emit(constants.events.SPEAK_REQUEST, this.roomInfo.user);
    }
  }

  onPeerError() {
    return (error) => {
      console.error('deu ruim', error);
    }
  }

  onPeerConnectionOpened() {
    return (peer) => {
      this.roomInfo.user.peerId = peer.id;
      this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo);
    }
  }

  onCallReceived() {
    return async (call) => {
      const stream = await this.roomService.getCurrentStream();
      call.answer(stream);
    }
  }

  onCallError() {
    return (call, error) => {
      const peerId = call.peer;
      this.roomService.disconnectPeer({ peerId });
    }
  }

  onCallClose() {
    return (call) => {
      const peerId = call.peer;
      this.roomService.disconnectPeer({ peerId });
    }
  }

  onStreamReceived() {
    return (call, stream) => {
      const callerId = call.peer;
      const { isCurrentId } = this.roomService.addReceivedPeer(call);
      this.view.renderAudioElement({
        callerId,
        stream,
        isCurrentId
      });
    }
  }

  onUserProfileUpgrade() {
    return (data) => {
      const attendee = new Attendee(data);
      if (attendee.isSpeaker) {
        this.roomService.upgradeUserPermission(attendee);
        this.view.addAttendeeOnGrid(attendee, true);
      }
      this.activateUserFeatures();
    }
  }

  onRoomUpdated() {
    return (data) => {
      const users = data.map(item => new Attendee(item));
      this.view.updateAttendeesOnGrid(users);
      this.roomService.updateCurrentUserProfile(users);
      this.activateUserFeatures();
    }
  }

  onDisconnected() {
    return (data) => {
      const attendee = new Attendee(data);
      this.view.removeItemFromGrid(attendee.id);
      this.roomService.disconnectPeer(attendee);
    }
  }

  onUserConnected() {
    return (data) => {
      const attendee = new Attendee(data);
      this.view.addAttendeeOnGrid(attendee);
      this.roomService.callNewUser(attendee);
    }
  }

  activateUserFeatures() {
    const currentUser = this.roomService.getCurrentUser();
    this.view.showUserFeatures(currentUser.isSpeaker);
  }
}