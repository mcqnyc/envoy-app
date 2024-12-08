const express = require('express');
const { middleware, errorMiddleware } = require('@envoy/envoy-integrations-sdk');

const app = express();
app.use(middleware());


app.post('/visit-duration', (req, res) => {
  res.send([
    {
      label: 'MaxVisitDuration',
      value: 180,
    },
  ]);
});

app.post('/validate-me', (req, res) => {
  const envoy = req.envoy
  const maxVisitDuration = envoy.payload.MaxVisitDuration

  if (maxVisitDuration >= 0 && maxVisitDuration <= 180) {
    res.send({message: 'Success!'});
  } else {
    res.sendFailed('These values are bad: the duration should be between 0 and 180 minutes');
  }
});

app.post('/visitor-sign-in', async (req, res) => {
  const envoy = req.envoy; // our middleware adds an "envoy" object to req.
  const job = envoy.job;
  // const hello = envoy.meta.config.HELLO;
//   const visitor = envoy.payload;
//   const visitorName = visitor.attributes['full-name'];

//   const message = `${hello} ${visitorName}!`; // our custom greeting
  await job.attach({ label: 'Event', value: 'Visitor signed in successfully' }); // show in the Envoy dashboard.
  // await job.attach({ label: 'Hello', value: message }); // show in the Envoy dashboard.

  // res.send({ hello });
  res.send();
  // res.send({ hello });
});


app.post('/visitor-sign-out', async (req, res) => {
  // const envoy = req.envoy; // our middleware adds an "envoy" object to req.
  // const job = envoy.job;
  // const goodbye = envoy.meta.config.GOODBYE;
  // const visitor = envoy.payload;
  // const visitorName = visitor.attributes['full-name'];
  const envoy = req.envoy
  console.log('envoy:', envoy)
  const maxVisitDuration = envoy.payload.MaxVisitDuration
  console.log('maxVisitDuration:', maxVisitDuration)

  // if (maxVisitDuration >= 0 && maxVisitDuration <= 180) {
  //   res.send({message: 'Success!'});
  // } else {
  //   res.sendFailed('These values are bad: the duration should be between 0 and 180 minutes');
  // }
  const message = `${goodbye} ${visitorName}!`;
  await job.attach({ label: 'Goodbye', value: message });
  
  res.send({ goodbye });
});


app.use(function (req, res, next) {
  console.log('Time:', Date.now())
  // console.log('req:', req)
  console.log('======')
  // console.log('res:', res)
  next()
})

app.use(errorMiddleware());

const listener = app.listen(process.env.PORT || 0, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
