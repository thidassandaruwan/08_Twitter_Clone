import { tweetsData } from "./tweets.js"; 
import { v4 as generateUUID} from "https://jspm.dev/uuid";

// Load saved tweets from localStorage, or use default data on first load
let tweets = JSON.parse(localStorage.getItem("tweetsData")) || structuredClone(tweetsData) || [];

document.addEventListener("click", (event) => {
    // if click is from tweet button
    if (event.target.closest("#tweet-btn")){
        tweet();
        return;
    }
    
    // if click is from tweet interaction
    if (event.target.closest(".tweet-detail")){
        handleTweetIteractions(event.target.closest(".tweet-detail"));
        return;
    }

    // if click is to reset the localstorage cahce for the page
    if (event.target.id === "clear-cache"){
        restoreOriginal();
        return
    }
});

function tweet(){
    const tweeTextArea = document.getElementById("tweet-input");
    const tweetContent = tweeTextArea.value.trim();
    if (!tweetContent){ return; }

    // add new tweet to the front of the array
    tweets.unshift({
            handle: `@scrimba 🏫`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: `${tweetContent}`,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: generateUUID(),
    });

    // save the changes to localfeed
    updateLocalStorage();
    // rerender the feed
    renderFeed();
    // clear the textField
    tweeTextArea.value = "";
}

function handleTweetIteractions(nearestDetailWrapper){
    const icon = nearestDetailWrapper.querySelector("i")
    if (!icon){ return; }

    // get the data action and id as tweetID
    const { action, id : tweetId} = icon.dataset;
    if (!action || !tweetId) { return; }

    switch (action) {
        case "reply":
            handleReplyClick(tweetId);
            break;

        case "like":
            handleLikeClick(tweetId);
            break;

        case "retweet":
            handleRetweetClick(tweetId);
            break;
    }
}

function handleLikeClick(tweetId){
    // get the tweet object
    const targetTweet = tweets.find(twt => twt.uuid === tweetId);
    // if the tweet doesn't exist return
    if (!targetTweet){ return; }
    // update the likestate and likes
    targetTweet.likes += targetTweet.isLiked ? -1 : 1;
    targetTweet.isLiked = !targetTweet.isLiked;
    
    updateLocalStorage();

    // update the tweet UI
    rerenderTweetDetails(targetTweet);
}

function handleRetweetClick(tweetId){
    // get the tweet object
    const targetTweet = tweets.find(twt => twt.uuid === tweetId);
    // if the tweet doesn't exist return
    if (!targetTweet){ return; }
    // update the retweetedstate and retweets
    targetTweet.retweets += targetTweet.isRetweeted ? -1 : 1;
    targetTweet.isRetweeted = !targetTweet.isRetweeted;
    
    updateLocalStorage();

    // update the tweet UI
    rerenderTweetDetails(targetTweet);
}

function handleReplyClick(tweetId){
    const repliesContainer = document.getElementById(`replies-${tweetId}`);
    if (!repliesContainer){ return; }

    repliesContainer.classList.toggle("hidden");
}


function rerenderTweetDetails(tweet){
    const tweetDetailContainer = document.querySelector(`[data-tweet-id="${tweet.uuid}"] .tweet-details`);
    if (!tweetDetailContainer){ return; }

    tweetDetailContainer.innerHTML = `
        <span class="tweet-detail">
            <i class="fa-regular fa-comment-dots" data-action="reply" data-id="${tweet.uuid}"></i>
            ${tweet.replies.length}
        </span>
        <span class="tweet-detail">
            <i class="${tweet.isLiked ? 'fa-solid liked' : 'fa-regular'} fa-heart" data-action="like" data-id="${tweet.uuid}"></i>
            <span class="like-count">${tweet.likes}</span>
        </span>
        <span class="tweet-detail">
            <i class=" fa-solid ${tweet.isRetweeted ? 'retweeted' : ''} fa-retweet" data-action="retweet" data-id="${tweet.uuid}"></i>
            ${tweet.retweets}
        </span>
    `;
}


function updateLocalStorage(){
    // update the localstorage cache with updated data
    localStorage.setItem("tweetsData", JSON.stringify(tweets));
}

function restoreOriginal(){
    localStorage.removeItem("tweetsData");
    tweets = structuredClone(tweetsData);
    renderFeed();
}

function renderFeed(){
    document.getElementById("feed").innerHTML = getFeedHtml();
}

function getFeedHtml(){
    return tweets.map( (tweet) => {
        return `
            <div class="tweet" data-tweet-id="${tweet.uuid}">
                <div class="tweet-inner">
                    <img src="${tweet.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${tweet.handle}</p>
                        <p class="tweet-text">${tweet.tweetText}</p>
                        <div class="tweet-details">
                            <span class="tweet-detail">
                                <i class="fa-regular fa-comment-dots" data-action="reply" data-id="${tweet.uuid}"></i>
                                ${tweet.replies.length}
                            </span>
                            <span class="tweet-detail">
                                <i class="${tweet.isLiked ? 'fa-solid liked' : 'fa-regular'} fa-heart" data-action="like" data-id="${tweet.uuid}"></i>
                                <span class="like-count">${tweet.likes}</span>
                            </span>
                            <span class="tweet-detail">
                                <i class=" fa-solid ${tweet.isRetweeted ? 'retweeted' : ''} fa-retweet" data-action="retweet" data-id="${tweet.uuid}"></i>
                                ${tweet.retweets}
                            </span>
                        </div>   
                    </div>            
                </div>
                ${getRepliesHtml(tweet)}
            </div>
            `;
    }).join("");
}

function getRepliesHtml(tweet){
    if (tweet.replies.length <= 0){ return ``; }
    
    const repliesHtml =  tweet.replies.map((reply) =>{
        return `
            <div class="tweet-reply">
                <div class="tweet-inner">
                    <img src="${reply.profilePic}" class="profile-pic">
                        <div>
                            <p class="handle">${reply.handle}</p>
                            <p class="tweet-text">${reply.tweetText}</p>
                        </div>
                    </div>
            </div>
        `;
    }).join("");

    return `
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>`;
}

renderFeed();
