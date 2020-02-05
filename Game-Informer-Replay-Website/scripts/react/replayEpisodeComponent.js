'use strict';

class ReplayEpisodeDisplayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { liked: false };
    }

    render() {
        if (this.state.liked) {
            return 'You liked this.';
        }

        return React.createElement(
            'button',
            { onClick: () => this.setState({ liked: true }) },
            'Like'
        );
    }
}

ReactDOM.render(
    <ReplayEpisodeDisplayer replayEpisodeObj={replayEpisode} />,
    document.getElementById('main')
);

const replayEpisode = (
    <section className="episode">
        <div className="episodeMain">
            <div className="episodeHeader">
                <h3 className="episodeTitle">{replayEpisode.episodeTitle}</h3>
                <div className="episodeNumber"></div>
            </div>
            <div className="thumbnail-container">
                <div className="episodeThumbnail">
                    <a title="">
                        <img className="episodeImage"
                            alt="replay episode thumbnail"
                            width={replayEpisode.image.width}
                            height={replayEpisode.image.height}
                            src={replayEpisode.image.srcset[0]}
                            srcset="" />
                        <time className="episodeLength" datetime="">{replayEpisode.videoLength}</time>
                        <div className="playOverlay">
                            <img alt="" width="256" height="256" src="images/play-button-icon-gi(1)-256.png" />
                        </div>
                    </a>
                </div>
            </div>
            <div className="episodeDetails">
                <div className="episodeAirDate"><b>Air Date: </b><time datetime="">{replayEpisode.getDateString()}</time></div>
                <div className="views-likes-container">
                    <div className="views" title="Views"><b><i className="fa fa-eye" aria-hidden="true"></i></b>{ReplayEpisode.addCommasToNumber(replayEpisode.views)}</div>
                    <div className="likes" title="Likes (Like Ratio)"><b><i className="fa fa-thumbs-up" aria-hidden="true"></i></b>{`${ReplayEpisode.addCommasToNumber(replayEpisode.likes)} (${replayEpisode.likeRatio}%)`}</div>
                </div>
                <div className="gi-crew">
                    <div className="episodeHosts"><b>Host: </b>{ReplayEpisode.listArrayAsString(replayEpisode.host)}</div>
                    <div className="episodeFeaturing"><b>Featuring: </b>ReplayEpisode.listArrayAsString(replayEpisode.featuring)}</div>
                </div>
                <div className="segments">
                    <div className="mainSegment"><b>Main Segment: </b></div>
                    <div className="middleSegment"><b>Middle Segment: </b></div>
                    <div className="secondSegment"><b>Second Segment: </b></div>
                </div>
            </div>
        </div>
        <hr />
        <div className="episodeMoreInfo"></div>
    </section>
);