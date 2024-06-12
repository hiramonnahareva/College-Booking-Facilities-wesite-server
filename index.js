require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const app = express();

// const port = process.env.PROT || 5000
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())


// function verifyJWT (req, res, next){
//   const authHeader = req.headers.authorization;
//   if(!authHeader){
//     return res.status(401).send({massage: 'UnAuthorization access'})
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
//     if(err){
//       return res.status(403).send({massage: 'Forbidden access'})
//     }
//     req.decoded = decoded;
//     next();
//   })
// }



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfpxf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// Ensure you replace <username> and <password> with actual MongoDB credentials
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
await client.connect();
console.log("db connected");
    const collegeCollection = client.db('College-booking').collection('Colleges');
    const collegeBooking = client.db('College-booking').collection('myCollege');
    const usersCollection = client.db('College-booking').collection('users');
    const reviewsCollection = client.db('College-booking').collection('review');

    // all colleges 
    app.get('/colleges', async(req, res)=> {
        const query = {};
        const cursor = collegeCollection.find(query)
        const colleges = await cursor.toArray();
        res.send(colleges);
    })

      // get one college by id 
      app.get('/college/:id', async(req, res)=> {
        const id = req.params.id;
        const query = {_id: ObjectId(id)}
        const college = await collegeCollection.findOne(query);
        res.send(college);
      })

    // all reviews
    app.get('/reviews', async(req, res)=> {
        const query = {};
        const cursor = reviewsCollection.find(query)
        const reviews = await cursor.toArray();
        res.send(reviews);
    })
    
    // all colleges
    app.get('/college', async(req, res)=> {
      const query = {};
      const cursor = collegeCollection.find(query)
      const college = await cursor.toArray();
      res.send(college);
  })
  // get college by email colleges
  app.get('/college', async(req, res)=> {
    let query ;
    const email =  req.query.email;
    if(email){
      query = {email: email}
    }
    else{
      query = {}
    }

    const cursor = collegeBooking.find(query)
    const order = await cursor.toArray();
    res.send(order);
})

    // // get one order by id 
    // app.get('/order/:id', async(req, res)=> {
    //   const id = req.params.id;
    //   const query = {_id: ObjectId(id)}
    //   const order = await collegeBooking.findOne(query);
    //   res.send(order);
    // })
    // app.patch('/order-update/:id', async(req, res)=> {
    //   const id = req.params.id;
    //   const payment = req.body;
    //   const filter = {_id: ObjectId(id)};
    //   console.log(payment)
    //   console.log(payment.transactionId)
    //   if(payment){
    //     const updateDoc = {
    //       $set: {
    //         paid: true,
    //         transactionId: payment.transactionId,
    //       }

    //     }
    //     const result = await payCollection.insertOne(payment);
    //     const updateOrder = await collegeBooking.updateOne(filter, updateDoc);
    //     res.send(updateDoc);
    //   }
    // })
    // // get one myCollege by email
    app.get('/myCollege/:email', async(req, res)=> {
      const email = req.params.email;
      const query = {email: email}
      const order = await collegeBooking.findOne(query);
      console.log(email, order)
      res.send(order);
    })
    // app.get('/admin/:email', async(req, res)=> {
    //   const email = req.params.email;
    //  const user = await usersCollection.findOne({email: email});
    //  const isAdmin = user.role === 'admin';
    //  res.send({admin: isAdmin});
    // })
    // app.post('/product', async(req, res)=> {
    //   const product = req.body;
    //   const result = await servicesCollection.insertOne(product);
    //   res.send(result);
    // })

    // set college by email
    app.put('/myCollege/:email', async (req, res) => {
      const email = req.params.email;
      const data = req.body
      const filter = { email:  email};
      const options = {upsert: true};
      const uspdateDoc = {
        $set: data,
      };
      const result = await collegeBooking.updateOne(filter, uspdateDoc, options);
      res.send(result);
    })

  //   app.get('/myCollege', async(req, res)=> {
  //     const query = {};
  //     const cursor = collegeBooking.find(query)
  //     const college = await cursor.toArray();
  //     res.send(college);
  // })


    // set one review
    app.post('/review',  async(req, res)=> {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    })
     // set all users
    app.get('/users',  async(req, res)=> {
      const users = await usersCollection.find().toArray();
      res.send(users);
    })
     // get user by email
    app.get('/user/:email', async(req, res)=> {
      const email = req.params.email;
      const user = await usersCollection.findOne({email: email});
      res.send(user);
    })
    // delete college
    // app.delete('/college/:id', async(req, res)=>{
    //   const college = req.body;
    //   const result = await collegeCollection.deleteOne(college);
    //   res.send(result);
    // })
    //       app.put('/user/admin/:email',  async(req, res) => {
    //   const email = req.params.email;
    //   const requester = req.decoded.email;
    //   const requesterAccount = await usersCollection.findOne({email: requester});
    //   if(requesterAccount.role === 'admin'){

    //     const filter = {email: email};
    //     const uspdateDoc = {
    //       $set: {role:'admin'},
    //     };
    //     const result = await usersCollection.updateOne(filter, uspdateDoc);
    //     res.send(result);
    //   }
    //   else{
    //     res.status(403).send({message: 'forbidden'});
    //   }
    // })
      // update user 
      app.put('/user/:id', async(req, res)=> {
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = {_id : ObjectId(id)};
        const options = { upsert: true };
        const updateDoc = {
            $set: {
              displayName: updatedUser.displayName,
              email: updatedUser.email,
                address: updatedUser.address,
                phone: updatedUser.phone,
                education: updatedUser.education,
            }
        };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.send(result);

    })
    // set user
    app.put('/users/:email', async(req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = {email: email};
      const options = {upsert: true};
      const uspdateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, uspdateDoc, options);
      res.send({result})
    })

  } 


  finally {
  }
}
run().catch(console.dir);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying a different port...`);
    app.listen(0, () => {  // 0 lets the system pick an available port
      console.log(`Server is running on port ${app.address().port}`);
    });
  } else {
    console.error('Server error:', err);
  }
}
)
app.get('/', (req, res) => {
  res.send('Hello World')
})

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })