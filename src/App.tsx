import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Layout } from "antd";

import { Firebase, Database } from "./config/firebase";
import { TopBar, Navigation, ArtworkDisplay, BottomBar } from "./components/";
import { Home, Search, Collection, Login } from "./pages";

import "./App.scss";

const { Sider, Content } = Layout;

interface Props {}

interface AppState {
  tracks: ITrack[];
  activeTrackID?: string;
  isPlaying: boolean;
  isLiked: boolean;
  playHistory: string[];
  user: string | null;
  favourites: string[];
}

export interface ITrack {
  artist: string;
  album: string;
  id: string;
  time: string;
  title: string;
  url: string;
  cover: string;
}

export default class App extends React.Component<Props, AppState> {
  state: AppState = {
    tracks: [],
    favourites: [],
    activeTrackID: undefined,
    isPlaying: false,
    isLiked: false,
    playHistory: [],
    user: null,
  };

  componentDidMount() {
    this.authListener();
  }

  authListener = () => {
    Firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user.uid });
        localStorage.setItem("user", user.uid);
        this.getLocalStorage();
        this.fetchData();
      } else {
        this.setState({ user: null });
        localStorage.removeItem("user");
      }
    });
  };

  getLocalStorage = () => {
    const localTracks = localStorage.getItem("tracks");
    if (localTracks) {
      this.setState({ tracks: JSON.parse(localTracks) });
    }
    const localFavourites = localStorage.getItem("favourites");
    if (localFavourites) {
      this.setState({ favourites: JSON.parse(localFavourites) });
    }
  };

  fetchData = () => {
    Database.collection("files")
      .orderBy("artist", "asc")
      .get()
      .then((snapshot) => {
        const newFiles: any = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          newFiles.push(data);
        });
        this.setState({
          tracks: newFiles,
        });
      })
      .catch((error) => console.log(error));
  };

  componentDidUpdate(
    _nextProps: Readonly<Props>,
    nextState: Readonly<AppState>
  ) {
    if (this.state !== nextState) {
      localStorage.setItem("tracks", JSON.stringify(nextState.tracks));
      localStorage.setItem("favourites", JSON.stringify(nextState.favourites));
    }
  }

  handleSetActiveTrack = (trackID: string) => {
    this.setState({ activeTrackID: trackID });
    this.setState({ isPlaying: true });
    if (this.state.activeTrackID === trackID) {
      this.togglePlayPause();
    }
  };

  togglePlayPause = () => {
    this.setState({ isPlaying: !this.state.isPlaying });
    if (this.state.activeTrackID === undefined) {
      this.setState({ activeTrackID: this.state.tracks[0].id });
    }
    let audio = document.querySelector("audio");
    if (audio) {
      this.state.isPlaying ? audio.pause() : audio.play();
    }
  };

  handlePlayPrev = () => {
    if (this.state.playHistory.length > 0) {
      this.setState({ activeTrackID: this.state.playHistory.pop() });
      this.setState({ isPlaying: true });
    }
  };

  handlePlayNext = () => {
    if (this.state.activeTrackID) {
      this.setState({
        playHistory: [...this.state.playHistory, this.state.activeTrackID],
      });
    }
    const currentTrackIndex = this.state.tracks.findIndex(
      (track) => track.id === this.state.activeTrackID
    );
    const totalTracks = this.state.tracks.length - 1;
    const nextTrackIndex =
      currentTrackIndex === totalTracks ? 0 : currentTrackIndex + 1;
    const nextTrack = this.state.tracks[nextTrackIndex].id;
    this.setState({ activeTrackID: nextTrack });
    this.setState({ isPlaying: true });
  };

  toggleLikeButton = (trackID: string) => {
    this.setState({ isLiked: !this.state.isLiked });
    const { favourites } = this.state;
    this.setState({ favourites: [...this.state.favourites, trackID] });
    if (
      favourites.find((alreadyFavouriteID) => alreadyFavouriteID === trackID)
    ) {
      this.setState({
        favourites: favourites.filter((favTrackID) => favTrackID !== trackID),
      });
    }
  };

  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Layout>
            <TopBar isUser={this.state.user !== null} />
            {this.state.user ? (
              <div>
                <Layout>
                  <Sider
                    className="side-bar"
                    breakpoint="sm"
                    collapsedWidth="70"
                  >
                    <Navigation />
                    <ArtworkDisplay
                      activeTrack={this.state.tracks.find(
                        (track) => track.id === this.state.activeTrackID
                      )}
                    />
                  </Sider>
                  <Content>
                    <Switch>
                      <Route
                        path="/"
                        exact
                        render={(Props) => (
                          <Home
                            tracks={this.state.tracks}
                            favourites={this.state.favourites}
                            activeTrackID={this.state.activeTrackID}
                            onTrackClick={this.handleSetActiveTrack}
                            onLikeButton={this.toggleLikeButton}
                            isPlaying={this.state.isPlaying}
                          />
                        )}
                      />
                      <Route
                        path="/search"
                        render={(Props) => (
                          <Search
                            tracks={this.state.tracks}
                            favourites={this.state.favourites}
                            activeTrackID={this.state.activeTrackID}
                            onTrackClick={this.handleSetActiveTrack}
                            onLikeButton={this.toggleLikeButton}
                            isPlaying={this.state.isPlaying}
                          />
                        )}
                      />
                      <Route
                        path="/collection"
                        render={(Props) => (
                          <Collection
                            tracks={this.state.tracks}
                            favourites={this.state.favourites}
                            activeTrackID={this.state.activeTrackID}
                            onTrackClick={this.handleSetActiveTrack}
                            onLikeButton={this.toggleLikeButton}
                            isPlaying={this.state.isPlaying}
                          />
                        )}
                      />
                    </Switch>
                  </Content>
                </Layout>
                <BottomBar
                  activeTrack={this.state.tracks.find(
                    (track) => track.id === this.state.activeTrackID
                  )}
                  favourites={this.state.favourites}
                  onLikeButton={this.toggleLikeButton}
                  isPlaying={this.state.isPlaying}
                  onPlayPause={this.togglePlayPause}
                  onPlayPrev={this.handlePlayPrev}
                  onPlayNext={this.handlePlayNext}
                />
              </div>
            ) : (
              <Login />
            )}
          </Layout>
        </div>
      </BrowserRouter>
    );
  }
}
