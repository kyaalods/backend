const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const localIpAddress = require("local-ip-address") 



const userAuth = require('../Models/userModel')
const validlicenseKey = require('../Models/verifyLicense')
const auth = require('../Middleware/Auth');
const e = require('express');


router.get('/', async (req, res)=>{
    try{
    const users =  await userAuth.find({}, {password: 0, ip: 0})

    res.json(users)
    }catch(err){
        res.json({error: err})
    }
})


router.post('/register', (req, res)=>{

    const { firstName, lastName, userName, email, password, ip, key} = req.body

    
    try{
        if(!firstName.trim() || !lastName.trim() || !userName.trim() || !email.trim() || !password.trim() || !ip ){
            res.json({error: 'Please fill in all the fields.'})
        }else{
            userAuth.findOne({$or:[{email: email.toLowerCase()},
            {userName: userName.toLowerCase()}, { ip: ip}],
        }).then((exist)=>{
            if(exist){
                
                if(exist.email === email.toLowerCase()){
                    res.json({error: "Email Address Already Registered"})
                }else if (exist.userName=== userName.toLowerCase()){
                    res.json({error: 'Username Already Registered'})
                }else if(exist.ip === ip){
                    res.json({error: 'User with same IP address already registered'})
                }
            }else{
                 /* encrypt password */
            bcrypt.hash(password, 12).then((hashedpassword) => {
                const registerUser = new userAuth({
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  userName: userName.toLowerCase().trim(),
                  email: email.toLowerCase().trim(),
                  password: hashedpassword.trim(),
                  ip:ip.trim(),
                  key: key,
                  TotalAccounts: 0,
                  TotalRaffles: 0
                });
  
                /* if User is not exist register */
                registerUser
                  .save()
                  .then((user) => {
                    /* Adding JWT TOKEN */
                    const token = jwt.sign(
                      { _id: user._id },
                      process.env.JWT_SECRET,
                      { expiresIn: "5h" }
                    );
  
                    const { _id, username, email } = user;
  
                    /* sending registered user to localStorage */
                    // res.json({ success: " Registered Successfully" });
                    res.json({
                      success: "Registration Successful",
                      token,
                      user: { _id},
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              });
            }
        })
        }

    }catch(err){
        res.json({error: err})
    }

})


router.post('/login', (req, res)=>{
    const { userName, password} = req.body

    try{
        if(!userName|| !password){
            res.json({error: "Please fill all the fields"})
        }else{
            userAuth.findOne({userName: userName.toLowerCase()}).then((user)=>{
                if(user){
                    bcrypt.compare(password, user.password).then((exist)=>{
                        if(exist){
                            const token = jwt.sign({
                                _id: user._id
                            },
                            process.env.JWT_SECRET,{
                                expiresIn: '5h'
                            })
                            const {_id, userName, email} = user;
                            res.json({success: "Login Successful", token, user:{_id}});

                        }

                    })
                }else{
                    res.json({ error: "Invalid username or password" });
                }
            })
        }

    }catch(err){
        res.json({error: err})
    }
})


router.post('/bind-key', auth, (req,res)=>{
   //MXDB-0428-0397-YEMI-4872
    const key = req.body.key
    const userId = req.user.id
    validate = false


    try{
        if(!key){
            res.json({error: 'The license key cannot be empty.'})
        }else{
           
            //Check if license exist

            validlicenseKey.find({}).then((keys)=>{
                if(keys){ 
                    validateKeys = []
                    keys.map((keys)=>{
                        const validKey = keys.licenseKey
                        if(validKey.includes(key)){
                            validate = true
                            //Remove Key if user successfully bound the key to dashboard
                            validlicenseKey.update({}, {$pull:{licenseKey:key}}).then((exist)=>{
                                if(exist){
                                    console.log('License removed')
                                }else{
                                    console.log('Invalid License')
                                }
                            })
                        }
                    })

                    //if license is valid
                    if(validate){
                        userAuth.findByIdAndUpdate({_id: userId},{
                            $set:{key: key}
                        }).then((user)=>{
                            res.json({user:user, message: 'You successfully bound your key!'})
                        })
                    }else{
                        // if license if invalid
                        res.json({error: 'Invalid License Key'})
                    }
                  

                }else{
                    console.log('Something went wrong')
                }
            })
         
        }
        
        


    }catch(err){
        res.json({error: err})
    }
})


router.post('/reset-license', auth, (req, res)=>{
        const ipAddress = req.body.ip
        const userId = req.user.id
        //ip = localIpAddress()
        
        try{
            userAuth.findByIdAndUpdate({_id: userId},{
                $set:{ip: ipAddress}
            }).then((user)=>{
                if(user){
                    res.json({user:user, ip:ip, message: 'The license was successfully reset.'})
                    
                }
                else{
                    res.json({error: 'Failed to reset license'})
                }
            })
        }catch(err){
            res.json({error: err})
        }
})

router.get('/HRB/version', (req,res)=>{
    res.json({'version': '0.0.32'})
})
// router.post('/key', (req, res)=>{
//         const key = req.body.key
//         const id = '627a4c003e3c3e04ba91dbba'
//         // const key = ['MXDB-0428-0397-YEMI-4872', 'RNWJ-0191-9454-JELA-6096','TDWB-0844-8253-GZDT-7990','XMFY-0347-9539-WXKT-5764','ZPCJ-0480-3087-BLAN-8514',]


//         licenseKey.findByIdAndUpdate({_id: id},{$push: {
//             licenseKey:key}}, {
//             new: true
//           } ).then((data)=>{
//             console.log(data)
//         })
       
//         // licenseKey.updateOne({_id:id}, {$push:{key:key}}).then((data)=>{
//         //     if(data){
//         //         console.log(data)
//         //     }
//         // })
// })

// router.get('/key', async (req,res)=>{
//     const oneKey = 'MXDB-0428-0397-YEMI-4872'
//     try{
//         licenseKey.find({}).then((keys)=>{
//             if(keys){ 
//                 keys.map((keyz)=>{
//                     console.log(keyz.licenseKey.includes(oneKey))
//                 })
//                 res.json({keys: keys})
//             }else{
//                 console.log('Something went wrong')
//             }
//         })
//     }catch(err){
//         res.json({error: err})
//     }
// })

router.get('/profile', auth, (req, res)=>{
    const userID  = req.user.id;

    try{
        userAuth.findOne({_id: userID}, {password: 0, ip: 0}).then((user)=>{
            res.json({user: user})
        })

    }catch(err){
        res.json({error:err})
    }
})


module.exports=router

