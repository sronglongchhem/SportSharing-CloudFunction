/* eslint-disable promise/always-return */
const functions = require('firebase-functions');
const generateUniqueId = require('node-unique-id')
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();


    // getClassById({"classId" : "-LdABj_8Hmf3LhaEweoe","authorId" : "h1YWXNupzLVkzdN6IQLRLuXyvQI3"})
// [START messageFunctionTrigger]
// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
exports.getClassById = functions.https.onCall((data, context) => {
    // [START_EXCLUDE]
    // [START readMessageData]
    // Message text passed from the client.
    console.log("dfgfd" + JSON.stringify(data))
    const text = data.classId;
    const authorId = data.authorId;
    // [END readMessageData]
    // [START messageHttpsErrors]
    // Checking attribute.
    if (!(typeof text === 'string') || text.length === 0 || 
        !(typeof authorId === 'string') || authorId.length === 0 ) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
          'one arguments "text" containing the message text to add.');
    }

    var classes =  admin.database().ref(`classes`).child(text).once('value')
    var reviews =  admin.database().ref(`reviews`).child(text).limitToFirst(2).once('value')
    var author =  admin.database().ref(`users`).child(authorId).once('value')
        return newPromise = Promise.all([classes,reviews,author])
            .then((snapshotContainsArrayOfSnapshots) => {
                // let classes= []
                snapshotContainsArrayOfSnapshots[0].val()
                console.log(snapshotContainsArrayOfSnapshots[2].val())

                var classes = snapshotContainsArrayOfSnapshots[0].val()

                if(classes === null){
                  throw new functions.https.HttpsError('not-found', 'Class not found');
                }

                var author = snapshotContainsArrayOfSnapshots[2].val()
                // classes.name=  author.name
                classes.authorDesc =  author.memo
                console.log(author.name)
                classes.authorName=  author.name
                classes.authorProfile=  author.profile
                if (!author.description) { classes.description =  ""}
                else  classes.description = author.description
                 

                return {"classes" :classes ,
                        "reviews" :snapshotContainsArrayOfSnapshots[1].val() }
            })

    // [END_EXCLUDE]
  });
  // [END messageFunctionTrigger]


//   userBooking({"classId" : "-LbTDLPrTvhjdYJqVpmR","userId" : "98tKelkTBGcaQOG5157Q2Lv5mgm2"})
exports.userBooking = functions.https.onCall((data, context) => {
    // [START_EXCLUDE]
    console.log("dfgfd" + JSON.stringify(data))
    const classId = data.classId;
    const userid = data.userId;

    if (!(typeof classId === 'string') || classId.length === 0 || 
        !(typeof userid === 'string') || userid.length === 0 ) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
          'one arguments "text" containing the message text to add.');
    }


    var user =  admin.database().ref(`users`).child(userid).once('value')
        return newPromise = Promise.all([user])
            .then((snapshotContainsArrayOfSnapshots) => {
                // let classes= [
                    var user = snapshotContainsArrayOfSnapshots[0].val()
                    data.name = user.name
                    data.profile = user.profile
                    data.orderId = generateUniqueId() 
                    console.log(data)

                    var myRef = admin.database().ref().push();
                    var key = myRef.key;
                       // eslint-disable-next-line promise/no-nesting
                       return Promise.all( [admin.database().ref(`booking`).child(key).set(data)]).then(
                           // eslint-disable-next-line promise/always-return
                           () => {
                               return {
                                   "code" : "0000"
                               }
                           }
                       ).catch(() => {
                         throw new functions.https.HttpsError('invalid-argument', 'failed to add booking');
                      });
            })

  });
  // [END messageFunctionTrigger]


//   98tKelkTBGcaQOG5157Q2Lv5mgm2
// userBookingList({"userId" : "98tKelkTBGcaQOG5157Q2Lv5mgm2"})
  exports.userBookingList = functions.https.onCall((data, context) => {
    // [START_EXCLUDE]
    console.log("dfgfd" + JSON.stringify(data))
    const userid = data.userId;

    if (!(typeof userid === 'string') || userid.length === 0 ) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
          'one arguments "text" containing the message text to add.');
    }

    return Promise.all( [admin.database().ref(`booking`).orderByChild('userId').equalTo(userid).once('value')]).then((snapshot)=>{

       // console.log(snapshot[0].val())
        var list =  snapshot[0].val()
        console.log("data size " +Object.keys(list).length)

        return {"data" :list}
    }).catch(() => {
        throw new functions.https.HttpsError('invalid-argument', 'failed to add booking');
     });

  });
  // [END messageFunctionTrigger]

//   userProfile({"userId" : "98tKelkTBGcaQOG5157Q2Lv5mgm2"})
  exports.userProfile = functions.https.onCall((data, context) => {
    // [START_EXCLUDE]
    console.log("dfgfd" + JSON.stringify(data))
    const userid = data.userId;

    if (!(typeof userid === 'string') || userid.length === 0 ) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
          'one arguments "text" containing the message text to add.');
    }

    // console.log(services.getTimestamp())
    var userBookingList = admin.database().ref(`booking`).orderByChild('userId').equalTo(userid).once('value')
    var userLikeList = admin.database().ref(`likes`).child(userid).once('value')

    return Promise.all( [userBookingList, userLikeList]).then((snapshot)=>{

       console.log(Object.keys(snapshot))
        var list =  snapshot[0].val()
        var like = snapshot[1].val()
      //  console.log("booking size " +Object.keys(snapshot).length)
      // console.log("like size " +snapshot[1].val())
        return {"booking_count" : list === null ? 0 :  Object.keys(list).length,
                "like_count" : like === null ? 0 : Object.keys(like).length}
    }).catch(() => {
        throw new functions.https.HttpsError('invalid-argument', 'failed to add booking');
     });

  });
  // [END messageFunctionTrigger]


// listener for when user add new post
exports.observeClassAdd = functions.database.ref('classes/{pushId}')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const original = snapshot.val();

        var postId = context.params.pushId;

        console.log(original);
        console.log(postId)

        return  Promise.all([addViewCount(postId),addReviews(postId)])


    });


 //   observeClassAdd({}, {params: {"pushId":"-LaeCAA9TezbYYlCGAEl"}})
function addViewCount(postId){
        return admin.database().ref(`classes`).child(postId).child('rating').set(genRand(1,5,1))
}

function addReviews(postId){
    return  admin.database().ref(`users`).once('value',(snapshot) => {
        var userData = snapshot.val()
        var dataArray = []

        for (let value of Object.keys(userData)) {
            // console.log("userId is =",value ); // John, then 30
            // console.log("profile is=",userData[value]);
            if (userData[value]['userType'] === "user"){
                dataArray.push(userData[value])
            }
            

        }
       console.log("user size is = " + dataArray.length)

        var addBatch =[];
        var numberOfReview = randomIntFromInterval(1,getArray().length - 1)
        addBatch.push(admin.database().ref(`classes`).child(postId).child('reviews').set(numberOfReview))

        // // eslint-disable-next-line no-empty
        for (var i = 0; i < numberOfReview ; i++){
            var user = dataArray[randomIntFromInterval(0,dataArray.length - 1)]
            var review = getArray()[randomIntFromInterval(0,getArray().length)]

            var data = {
                proifle : user['profile'],
                name : user['name'],
                uid : user['uid'],
                postId : postId,
                text : review,
                timeStamp : Math.floor(Date.now())

            }

            var myRef = admin.database().ref().push();
            var key = myRef.key;

     
            var task = admin.database().ref(`reviews`).child(postId).child(key).set(data)
            var usertask = admin.database().ref(`user_reviews`).child(user['uid']).child(postId).child(key).set(true)
            addBatch.push(task,usertask)
        } 

        return Promise.all(addBatch)

});
}

// profileChange({before: { }, after:{ email: 'user22@email.com',memo: '',name: 'Adam3',profile: 'https://firebasestorage.googleapis.com/v0/b/sportshare-f56ca.appspot.com/o/photos%2F88666B57-97D8-419F-9789-0AFD5DF413C9.jpg?alt=media&token=995819dc-5a97-41b6-93f7-2b3dd03b5f42',uid: '4OTomFqcJIUnr7Bq5sObA4QZHCO2',userType: 'user' }})

exports.profileChange = functions.database.ref('/users/{pushId}')
    .onWrite((change, context) => {

      // Exit when the data is deleted.
      if (!change.after.exists()) {
        console.log("Exit when the data is deleted.")
        return null;
      }
      // Grab the current value of what was written to the Realtime Database.
      const original = change.after.val();
      console.log('Uppercasing', context.params.pushId, original);
      const userid = original.uid

      // console.log(services.getTimestamp())
    var userBookingList = admin.database().ref(`booking`).orderByChild('userId').equalTo(userid).once('value')
    var userReviewList = admin.database().ref(`user_reviews`).child(userid).once('value')

    return Promise.all( [userBookingList,userReviewList]).then((snapshot)=>{

       console.log(Object.keys(snapshot))
        var list =  snapshot[0].val()
        var reviewlist =  snapshot[1].val()
        var task = []

     //   console.log(reviewlist)

        if(list !== null){
          Object.keys(list).forEach((key) => {
            //    console.log(key, list[key]);
                // eslint-disable-next-line no-empty
                if (list[key].userId === userid){
                   task.push(admin.database().ref(`booking`).child(key).child('profile').set(original.profile))
                }
              });
           //   console.log("take is",task)
        }

        if(reviewlist !== null){
          Object.keys(reviewlist).forEach((key) => {
          //  console.log("main" , key);
            const classId = key
            const list =  reviewlist[key]
            Object.keys(list).forEach((key) => {
         //     console.log("sub ",key, list[key]);
              task.push(admin.database().ref(`reviews`).child(classId).child(key).child('profile').set(original.profile))
            });
           
           });
        //  console.log("take is",task)
        }
        return Promise.all(task)
    })


    // return null
    });


function genRand(min, max, decimalPlaces) {  
    var rand = Math.random()*(max-min) + min;
    var power = Math.pow(10, decimalPlaces);
    return Math.floor(rand*power) / power;
}

function randomIntFromInterval(min,max) // min and max included
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function getArray(){
    return reviewArray = ["Paul was super attentive and knowledgeable about the mountain and with each person he brought up. It was great that he offered boards so that more experienced riders like myself didn’t have to go through the hassle of renting. He went above and beyond to ensure every person he took up had a great time and catered to anything we needed. Would highly recommend booking with Paul!",
"Paul was nice and passionate host!!! indeed. Actually, i took my gopro because i wanna make nice video. And he helped me to taking fuxxing nice video. He gave me an informative advice even though i'm not good at speaking english. i'm gonna find Paul if i wanna go to cypress again. from korea. Sujong☺️",
"Paul was a very friendly and accommodating host! Since it’s our first time skiing and Paul specializes more in snowboarding, we decided to go explore other activities around, and Paul gave us rides around. I also had a flight to catch later, and Paul dropped me off separately at a train station that had connecting trains that made the whole process a lot easier. Paul was also just generally very friendly and easy to talk to!",
"Definitely a recommend with Paul whether you're visiting Vancouver or a local. He will take care of you and make sure you have an excellent experience. And don't be afraid if you're a first timer, he'll give you tips that'll make your experience less about laying in the snow and help you go down the slopes.",
"Paul is very friendly and helpful. Although we are beginners in skiing and Paul is better at teaching snowboarding, we had a good time trying snow tubing and enjoying the beautiful view of the mountain. I fully recommend this experience with Paul.",
"Paul was professional yet warm and welcoming. He was also flexible and accommodating which made the experience fun and memorable for us since it was stress free. We are glad that we booked this experience with Paul.",
"Cette expérience avec Paul nous a permis de vivre une première sortie de ski avec mes filles (13 et 6 ans) sans soucis. Il a même pu nous suggérer un instructeur pour une leçon de ski à la dernière minute...",
"Paul, es un gran anfitrión! Hace la experiencia muy divertida y te ayuda cañón a perder el miedo si es que es tu primera vez; es paciente y muy puntual.",
"Thanks Paul for a great experience. I’m an inexperienced snowboarder, but I still had fun out there. There was a great energy with Paul and he was very accommodating of everyone’s request",
"Great way to get up the local mountains in the Vancouver area, if you are not from the here or have a means of driving yourself. Not being a native or familiar with Cypress mountain, Paul was more than a great host and guide. He showed me some great tree lines, first hand, and had awesome suggestions regarding runs I should take. Overall, it was a great day and experience! I will definitely hit up Paul for a ride up the hill to Cypress the next time I come up to Vancouver!",
"Great option if you’re looking to go skiing for the day! Paul is super nice and picks you up and drops your off and is great at communication. Also does your passes and paper work so you can just focus on having fun. Great experience.",
"Great and easy way to get out of the city and onto the slopes for a day without having to drive for hours and hours. Paul was great at helping inexperienced guests navigate their way through the equipment rental process and got them on the slopes fast.",
"We had a great trip with Paul during our trip to Vancouver! He was very communicative and made the trip to Cypress Mountain (on Family Day) very pleasant. Further, since we were traveling to the country, he helped with sorting out our lift tickets, gear, and equipment. He also was accommodating to our busy schedules and got us back in time to make our flight back to the US. I fully recommend this experience in Paul and will look him up the next time we're in BC.",
"It was a great experience, really fun even for beginners, you will enjoy the place and the activity, Paul looks for everything and that's more confortable.",
"Paul’s experience was great! This was my first visit to Vancouver and I knew I really wanted to go skiing. This experience was wonderful and easy. Paul guided us on the mountain we were skiing at and made it easy to communicate with him",
"Very nice day drip to go skiing in Vancouver. If you haven’t skiied before I would recommend a lesson it not the bar is always an option. ❤️",
"Cypress Mountain hat tolle Ausblicke und die Pisten sind für einen Tag auch vollkommen ausreichend und gut. Bei gutem Wetter ein Muss!! Paul ist ein super netter und lustiger Kerl, der sich viel Mühe gibt. Er ist easy going und kümmert sich trotzdem sehr gut um alle und alles. Ich empfehle den Trip auf jeden Fall weiter. Hat sehr viel Spaß gemacht!!!",
"This was a fab experience! Incredible views and the group was great - we had a lot of fun! Paul was accommodating and helpful in giving us tips to the best slopes and photo spots. He went out of his way to show you the beautiful spots around the mountain and sightseeing views on the trip back. So happy I decided to sign up, would definitely recommend this experience! Thanks Paul ⛰",
"Paul was super attentive and knowledgeable about the mountain and with each person he brought up. It was great that he offered boards so that more experienced riders like myself didn’t have to go through the hassle of renting. He went above and beyond to ensure every person he took up had a great time and catered to anything we needed. Would highly recommend booking with Paul!",
"Paul was nice and passionate host!!! indeed. Actually, i took my gopro because i wanna make nice video. And he helped me to taking fuxxing nice video. He gave me an informative advice even though i'm not good at speaking english. i'm gonna find Paul if i wanna go to cypress again. from korea. Sujong☺️",
"Paul was a very friendly and accommodating host! Since it’s our first time skiing and Paul specializes more in snowboarding, we decided to go explore other activities around, and Paul gave us rides around. I also had a flight to catch later, and Paul dropped me off separately at a train station that had connecting trains that made the whole process a lot easier. Paul was also just generally very friendly and easy to talk to!",
"Definitely a recommend with Paul whether you're visiting Vancouver or a local. He will take care of you and make sure you have an excellent experience. And don't be afraid if you're a first timer, he'll give you tips that'll make your experience less about laying in the snow and help you go down the slopes.",
"Paul is very friendly and helpful. Although we are beginners in skiing and Paul is better at teaching snowboarding, we had a good time trying snow tubing and enjoying the beautiful view of the mountain. I fully recommend this experience with Paul.",
"Paul was professional yet warm and welcoming. He was also flexible and accommodating which made the experience fun and memorable for us since it was stress free. We are glad that we booked this experience with Paul.",
"Cette expérience avec Paul nous a permis de vivre une première sortie de ski avec mes filles (13 et 6 ans) sans soucis. Il a même pu nous suggérer un instructeur pour une leçon de ski à la dernière minute...",
"Paul, es un gran anfitrión! Hace la experiencia muy divertida y te ayuda cañón a perder el miedo si es que es tu primera vez; es paciente y muy puntual.",
"Thanks Paul for a great experience. I’m an inexperienced snowboarder, but I still had fun out there. There was a great energy with Paul and he was very accommodating of everyone’s request",
"Great way to get up the local mountains in the Vancouver area, if you are not from the here or have a means of driving yourself. Not being a native or familiar with Cypress mountain, Paul was more than a great host and guide. He showed me some great tree lines, first hand, and had awesome suggestions regarding runs I should take. Overall, it was a great day and experience! I will definitely hit up Paul for a ride up the hill to Cypress the next time I come up to Vancouver!",
"Great option if you’re looking to go skiing for the day! Paul is super nice and picks you up and drops your off and is great at communication. Also does your passes and paper work so you can just focus on having fun. Great experience.",
"Great and easy way to get out of the city and onto the slopes for a day without having to drive for hours and hours. Paul was great at helping inexperienced guests navigate their way through the equipment rental process and got them on the slopes fast.",
"We had a great trip with Paul during our trip to Vancouver! He was very communicative and made the trip to Cypress Mountain (on Family Day) very pleasant. Further, since we were traveling to the country, he helped with sorting out our lift tickets, gear, and equipment. He also was accommodating to our busy schedules and got us back in time to make our flight back to the US. I fully recommend this experience in Paul and will look him up the next time we're in BC.",
"It was a great experience, really fun even for beginners, you will enjoy the place and the activity, Paul looks for everything and that's more confortable.",
"Paul’s experience was great! This was my first visit to Vancouver and I knew I really wanted to go skiing. This experience was wonderful and easy. Paul guided us on the mountain we were skiing at and made it easy to communicate with him",
"Very nice day drip to go skiing in Vancouver. If you haven’t skiied before I would recommend a lesson it not the bar is always an option. ❤️",
"Cypress Mountain hat tolle Ausblicke und die Pisten sind für einen Tag auch vollkommen ausreichend und gut. Bei gutem Wetter ein Muss!! Paul ist ein super netter und lustiger Kerl, der sich viel Mühe gibt. Er ist easy going und kümmert sich trotzdem sehr gut um alle und alles. Ich empfehle den Trip auf jeden Fall weiter. Hat sehr viel Spaß gemacht!!!",
"This was a fab experience! Incredible views and the group was great - we had a lot of fun! Paul was accommodating and helpful in giving us tips to the best slopes and photo spots. He went out of his way to show you the beautiful spots around the mountain and sightseeing views on the trip back. So happy I decided to sign up, would definitely recommend this experience! Thanks Paul ⛰",
"Paul was super attentive and knowledgeable about the mountain and with each person he brought up. It was great that he offered boards so that more experienced riders like myself didn’t have to go through the hassle of renting. He went above and beyond to ensure every person he took up had a great time and catered to anything we needed. Would highly recommend booking with Paul!",
"Paul was nice and passionate host!!! indeed. Actually, i took my gopro because i wanna make nice video. And he helped me to taking fuxxing nice video. He gave me an informative advice even though i'm not good at speaking english. i'm gonna find Paul if i wanna go to cypress again. from korea. Sujong☺️",
"Paul was a very friendly and accommodating host! Since it’s our first time skiing and Paul specializes more in snowboarding, we decided to go explore other activities around, and Paul gave us rides around. I also had a flight to catch later, and Paul dropped me off separately at a train station that had connecting trains that made the whole process a lot easier. Paul was also just generally very friendly and easy to talk to!",
"Definitely a recommend with Paul whether you're visiting Vancouver or a local. He will take care of you and make sure you have an excellent experience. And don't be afraid if you're a first timer, he'll give you tips that'll make your experience less about laying in the snow and help you go down the slopes.",
"Paul is very friendly and helpful. Although we are beginners in skiing and Paul is better at teaching snowboarding, we had a good time trying snow tubing and enjoying the beautiful view of the mountain. I fully recommend this experience with Paul.",
"Paul was professional yet warm and welcoming. He was also flexible and accommodating which made the experience fun and memorable for us since it was stress free. We are glad that we booked this experience with Paul.",
"Cette expérience avec Paul nous a permis de vivre une première sortie de ski avec mes filles (13 et 6 ans) sans soucis. Il a même pu nous suggérer un instructeur pour une leçon de ski à la dernière minute...",
"Paul, es un gran anfitrión! Hace la experiencia muy divertida y te ayuda cañón a perder el miedo si es que es tu primera vez; es paciente y muy puntual.",
"Thanks Paul for a great experience. I’m an inexperienced snowboarder, but I still had fun out there. There was a great energy with Paul and he was very accommodating of everyone’s request",
"Great way to get up the local mountains in the Vancouver area, if you are not from the here or have a means of driving yourself. Not being a native or familiar with Cypress mountain, Paul was more than a great host and guide. He showed me some great tree lines, first hand, and had awesome suggestions regarding runs I should take. Overall, it was a great day and experience! I will definitely hit up Paul for a ride up the hill to Cypress the next time I come up to Vancouver!",
"Great option if you’re looking to go skiing for the day! Paul is super nice and picks you up and drops your off and is great at communication. Also does your passes and paper work so you can just focus on having fun. Great experience.",
"Great and easy way to get out of the city and onto the slopes for a day without having to drive for hours and hours. Paul was great at helping inexperienced guests navigate their way through the equipment rental process and got them on the slopes fast.",
"We had a great trip with Paul during our trip to Vancouver! He was very communicative and made the trip to Cypress Mountain (on Family Day) very pleasant. Further, since we were traveling to the country, he helped with sorting out our lift tickets, gear, and equipment. He also was accommodating to our busy schedules and got us back in time to make our flight back to the US. I fully recommend this experience in Paul and will look him up the next time we're in BC.",
"It was a great experience, really fun even for beginners, you will enjoy the place and the activity, Paul looks for everything and that's more confortable.",
"Paul’s experience was great! This was my first visit to Vancouver and I knew I really wanted to go skiing. This experience was wonderful and easy. Paul guided us on the mountain we were skiing at and made it easy to communicate with him",
"Very nice day drip to go skiing in Vancouver. If you haven’t skiied before I would recommend a lesson it not the bar is always an option. ❤️",
"Cypress Mountain hat tolle Ausblicke und die Pisten sind für einen Tag auch vollkommen ausreichend und gut. Bei gutem Wetter ein Muss!! Paul ist ein super netter und lustiger Kerl, der sich viel Mühe gibt. Er ist easy going und kümmert sich trotzdem sehr gut um alle und alles. Ich empfehle den Trip auf jeden Fall weiter. Hat sehr viel Spaß gemacht!!!",
"This was a fab experience! Incredible views and the group was great - we had a lot of fun! Paul was accommodating and helpful in giving us tips to the best slopes and photo spots. He went out of his way to show you the beautiful spots around the mountain and sightseeing views on the trip back. So happy I decided to sign up, would definitely recommend this experience! Thanks Paul ⛰",
"Paul was super attentive and knowledgeable about the mountain and with each person he brought up. It was great that he offered boards so that more experienced riders like myself didn’t have to go through the hassle of renting. He went above and beyond to ensure every person he took up had a great time and catered to anything we needed. Would highly recommend booking with Paul!",
"Paul was nice and passionate host!!! indeed. Actually, i took my gopro because i wanna make nice video. And he helped me to taking fuxxing nice video. He gave me an informative advice even though i'm not good at speaking english. i'm gonna find Paul if i wanna go to cypress again. from korea. Sujong☺️",
"Paul was a very friendly and accommodating host! Since it’s our first time skiing and Paul specializes more in snowboarding, we decided to go explore other activities around, and Paul gave us rides around. I also had a flight to catch later, and Paul dropped me off separately at a train station that had connecting trains that made the whole process a lot easier. Paul was also just generally very friendly and easy to talk to!",
"Definitely a recommend with Paul whether you're visiting Vancouver or a local. He will take care of you and make sure you have an excellent experience. And don't be afraid if you're a first timer, he'll give you tips that'll make your experience less about laying in the snow and help you go down the slopes.",
"Paul is very friendly and helpful. Although we are beginners in skiing and Paul is better at teaching snowboarding, we had a good time trying snow tubing and enjoying the beautiful view of the mountain. I fully recommend this experience with Paul.",
"Paul was professional yet warm and welcoming. He was also flexible and accommodating which made the experience fun and memorable for us since it was stress free. We are glad that we booked this experience with Paul.",
"Cette expérience avec Paul nous a permis de vivre une première sortie de ski avec mes filles (13 et 6 ans) sans soucis. Il a même pu nous suggérer un instructeur pour une leçon de ski à la dernière minute...",
"Paul, es un gran anfitrión! Hace la experiencia muy divertida y te ayuda cañón a perder el miedo si es que es tu primera vez; es paciente y muy puntual.",
"Thanks Paul for a great experience. I’m an inexperienced snowboarder, but I still had fun out there. There was a great energy with Paul and he was very accommodating of everyone’s request",
"Great way to get up the local mountains in the Vancouver area, if you are not from the here or have a means of driving yourself. Not being a native or familiar with Cypress mountain, Paul was more than a great host and guide. He showed me some great tree lines, first hand, and had awesome suggestions regarding runs I should take. Overall, it was a great day and experience! I will definitely hit up Paul for a ride up the hill to Cypress the next time I come up to Vancouver!",
"Great option if you’re looking to go skiing for the day! Paul is super nice and picks you up and drops your off and is great at communication. Also does your passes and paper work so you can just focus on having fun. Great experience.",
"Great and easy way to get out of the city and onto the slopes for a day without having to drive for hours and hours. Paul was great at helping inexperienced guests navigate their way through the equipment rental process and got them on the slopes fast.",
"We had a great trip with Paul during our trip to Vancouver! He was very communicative and made the trip to Cypress Mountain (on Family Day) very pleasant. Further, since we were traveling to the country, he helped with sorting out our lift tickets, gear, and equipment. He also was accommodating to our busy schedules and got us back in time to make our flight back to the US. I fully recommend this experience in Paul and will look him up the next time we're in BC.",
"It was a great experience, really fun even for beginners, you will enjoy the place and the activity, Paul looks for everything and that's more confortable.",
"Paul’s experience was great! This was my first visit to Vancouver and I knew I really wanted to go skiing. This experience was wonderful and easy. Paul guided us on the mountain we were skiing at and made it easy to communicate with him",
"Very nice day drip to go skiing in Vancouver. If you haven’t skiied before I would recommend a lesson it not the bar is always an option. ❤️",
"Cypress Mountain hat tolle Ausblicke und die Pisten sind für einen Tag auch vollkommen ausreichend und gut. Bei gutem Wetter ein Muss!! Paul ist ein super netter und lustiger Kerl, der sich viel Mühe gibt. Er ist easy going und kümmert sich trotzdem sehr gut um alle und alles. Ich empfehle den Trip auf jeden Fall weiter. Hat sehr viel Spaß gemacht!!!",
"This was a fab experience! Incredible views and the group was great - we had a lot of fun! Paul was accommodating and helpful in giving us tips to the best slopes and photo spots. He went out of his way to show you the beautiful spots around the mountain and sightseeing views on the trip back. So happy I decided to sign up, would definitely recommend this experience! Thanks Paul ⛰",
"Paul was super attentive and knowledgeable about the mountain and with each person he brought up. It was great that he offered boards so that more experienced riders like myself didn’t have to go through the hassle of renting. He went above and beyond to ensure every person he took up had a great time and catered to anything we needed. Would highly recommend booking with Paul!",
"Paul was nice and passionate host!!! indeed. Actually, i took my gopro because i wanna make nice video. And he helped me to taking fuxxing nice video. He gave me an informative advice even though i'm not good at speaking english. i'm gonna find Paul if i wanna go to cypress again. from korea. Sujong☺️",
"Paul was a very friendly and accommodating host! Since it’s our first time skiing and Paul specializes more in snowboarding, we decided to go explore other activities around, and Paul gave us rides around. I also had a flight to catch later, and Paul dropped me off separately at a train station that had connecting trains that made the whole process a lot easier. Paul was also just generally very friendly and easy to talk to!",
"Definitely a recommend with Paul whether you're visiting Vancouver or a local. He will take care of you and make sure you have an excellent experience. And don't be afraid if you're a first timer, he'll give you tips that'll make your experience less about laying in the snow and help you go down the slopes.",
"Paul is very friendly and helpful. Although we are beginners in skiing and Paul is better at teaching snowboarding, we had a good time trying snow tubing and enjoying the beautiful view of the mountain. I fully recommend this experience with Paul.",
"Paul was professional yet warm and welcoming. He was also flexible and accommodating which made the experience fun and memorable for us since it was stress free. We are glad that we booked this experience with Paul.",
"Cette expérience avec Paul nous a permis de vivre une première sortie de ski avec mes filles (13 et 6 ans) sans soucis. Il a même pu nous suggérer un instructeur pour une leçon de ski à la dernière minute...",
"Paul, es un gran anfitrión! Hace la experiencia muy divertida y te ayuda cañón a perder el miedo si es que es tu primera vez; es paciente y muy puntual.",
"Thanks Paul for a great experience. I’m an inexperienced snowboarder, but I still had fun out there. There was a great energy with Paul and he was very accommodating of everyone’s request",
"Great way to get up the local mountains in the Vancouver area, if you are not from the here or have a means of driving yourself. Not being a native or familiar with Cypress mountain, Paul was more than a great host and guide. He showed me some great tree lines, first hand, and had awesome suggestions regarding runs I should take. Overall, it was a great day and experience! I will definitely hit up Paul for a ride up the hill to Cypress the next time I come up to Vancouver!",
"Great option if you’re looking to go skiing for the day! Paul is super nice and picks you up and drops your off and is great at communication. Also does your passes and paper work so you can just focus on having fun. Great experience.",
"Great and easy way to get out of the city and onto the slopes for a day without having to drive for hours and hours. Paul was great at helping inexperienced guests navigate their way through the equipment rental process and got them on the slopes fast.",
"We had a great trip with Paul during our trip to Vancouver! He was very communicative and made the trip to Cypress Mountain (on Family Day) very pleasant. Further, since we were traveling to the country, he helped with sorting out our lift tickets, gear, and equipment. He also was accommodating to our busy schedules and got us back in time to make our flight back to the US. I fully recommend this experience in Paul and will look him up the next time we're in BC.",
"It was a great experience, really fun even for beginners, you will enjoy the place and the activity, Paul looks for everything and that's more confortable.",
"Paul’s experience was great! This was my first visit to Vancouver and I knew I really wanted to go skiing. This experience was wonderful and easy. Paul guided us on the mountain we were skiing at and made it easy to communicate with him",
"Very nice day drip to go skiing in Vancouver. If you haven’t skiied before I would recommend a lesson it not the bar is always an option. ❤️",
"Cypress Mountain hat tolle Ausblicke und die Pisten sind für einen Tag auch vollkommen ausreichend und gut. Bei gutem Wetter ein Muss!! Paul ist ein super netter und lustiger Kerl, der sich viel Mühe gibt. Er ist easy going und kümmert sich trotzdem sehr gut um alle und alles. Ich empfehle den Trip auf jeden Fall weiter. Hat sehr viel Spaß gemacht!!!",
"This was a fab experience! Incredible views and the group was great - we had a lot of fun! Paul was accommodating and helpful in giving us tips to the best slopes and photo spots. He went out of his way to show you the beautiful spots around the mountain and sightseeing views on the trip back. So happy I decided to sign up, would definitely recommend this experience! Thanks Paul ⛰"
]
}
// addUserLike({"userId" : "98tKelkTBGcaQOG5157Q2Lv5mgm2","classId" : "-LcsNuXuSlxgPDMr3PsE"})
exports.addUserLike = functions.https.onCall((data, context) => {
    // [START_EXCLUDE]
    console.log("dfgfd" + JSON.stringify(data))
    const userId = data.userId;
    const classId = data.classId;

    if (!(typeof userId === 'string') || userId.length === 0 ) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
          'one arguments "text" containing the message text to add.');
    }

    if (!(typeof classId === 'string') || classId.length === 0 ) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one arguments "text" containing the message text to add.');
      }

    return Promise.all( [admin.database().ref(`likes`).child(userId).child(classId).once('value')]).then((snapshot)=>{

       var list =  snapshot[0].val()
 
       // eslint-disable-next-line promise/always-return
       if (list === null){

        // eslint-disable-next-line promise/no-nesting
        return Promise.all( [admin.database().ref(`likes`).child(userId).child(classId).set(true)]).then((snapshot)=>{
            // var list =  snapshot[0].val()
            return {"data" :"added"}
         }).catch(() => {
             throw new functions.https.HttpsError('invalid-argument', 'failed dfgto booking');
          });
       }else{
        // eslint-disable-next-line promise/no-nesting
        return Promise.all( [admin.database().ref(`likes`).child(userId).child(classId).remove()]).then((snapshot)=>{
            // var list =  snapshot[0].val()
            return {"data" :"removed"}
         }).catch(() => {
             throw new functions.https.HttpsError('invalid-argument', 'failed dfgto booking');
          });
       }
        
    }).catch(() => {
        throw new functions.https.HttpsError('invalid-argument', 'failed to booking');
     });

  });

//   userFavorite({"userId" : "4OTomFqcJIUnr7Bq5sObA4QZHCO2"})
exports.userFavorite = functions.https.onCall((data, context) => {
    // [START_EXCLUDE]
    // console.log("dfgfd" + JSON.stringify(data))
    const userId = data.userId;

    if (!(typeof userId === 'string') || userId.length === 0 ) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
          'one arguments "text" containing the message text to add.');
    }


    return Promise.all( [admin.database().ref(`likes`).child(userId).once('value')]).then((snapshot)=>{

       var list =  snapshot[0].val()
 
       // eslint-disable-next-line promise/always-return
       if (list === null){
          return {"data" :list}
        // eslint-disable-next-line promise/no-nesting

       }
       var tasks = []

       Object.keys(list).forEach((key) => {
        console.log(key, list[key]);
        tasks.push(admin.database().ref(`classes`).child(key).once('value'))
      });

        // eslint-disable-next-line promise/no-nesting
        return Promise.all(tasks).then((snapshot)=>{
            var list =  snapshot.length

          var classList = {}
          snapshot.forEach((data, index) => {
              
              const model = data.val()
              console.log("key is",data.key)
                classList[data.key] = model
            });

            // console.log(classList)
            return {"data" :classList}
         }).catch(() => {
             throw new functions.https.HttpsError('invalid-argument', 'failed dfgto booking');
          });

        
    }).catch(() => {
        throw new functions.https.HttpsError('invalid-argument', 'failed to booking');
     });

  });

  //review list 
  // classReviews({"classId" : "-Ld3jk30BUDKMVbuuj98"})
  exports.classReviews = functions.https.onCall((data, context) => {
    // [START_EXCLUDE]
    // console.log("dfgfd" + JSON.stringify(data))
    const classId = data.classId;

    if (!(typeof classId === 'string') || classId.length === 0 ) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
          'one arguments "text" containing the message text to add.');
    }

    return Promise.all( [admin.database().ref(`reviews`).child(classId).once('value')]).then((snapshot)=>{

       var list =  snapshot[0].val()
       
       return {"data" :list}
    }).catch(() => {
        throw new functions.https.HttpsError('invalid-argument', 'failed to booking');
     });

  });

// Trainer : 
// trainerBookingList({"authorId" : "91Uj65Ak0sUaDoT1y8W8r3LbaOC2"})
exports.trainerBookingList = functions.https.onCall((data, context) => {
    // [START_EXCLUDE]
    console.log("dfgfd" + JSON.stringify(data))
    const authorId = data.authorId;

    if (!(typeof authorId === 'string') || authorId.length === 0 ) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
          'one arguments "text" containing the message text to add.');
    }

    return Promise.all( [admin.database().ref(`booking`).orderByChild('authorId').equalTo(authorId).once('value')]).then((snapshot)=>{

       // console.log(snapshot[0].val())
       var list =  snapshot[0].val()
       
        
       return {"data" :list}
    }).catch(() => {
        throw new functions.https.HttpsError('invalid-argument', 'failed to booking');
     });

  });

  exports.ping = functions.https.onCall((data, context) => {
      return {"date" : "success"}
  });
  // [END messageFunctionTrigger]

