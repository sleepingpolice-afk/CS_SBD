//wkwkwk ty technoskill 1.0

const pg = require("../utils/connect");
const cloudinary = require("cloudinary").v2;
const bcrypt = require('bcrypt');

//ini yg lama bang
// exports.register = async function register(req, res){


//     if (!req.query.email || !req.query.password || !req.query.name) {
//         return res.status(400).json({ message: 'Tidak boleh kosong!' });
//     }

//     try {
//         const result = await pg.query(
//             'INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *',
//             [req.query.name, req.query.email, req.query.password]
//         );
//     res.status(201).json(result.rows[0]);
//     } catch (error) {
//         console.error('Error inserting user:', error);
//         res.status(500).json({ message: 'Fail to register' });
//     }
// }

exports.register = async function register(req, res){
    //sesuai TP
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/

    //bcrpy sesuai daste?
    const saltRounds = 10;

    if (!req.query.email || !req.query.password || !req.query.name) {
        return res.status(400).json({ message: 'Tidak boleh kosong!' });
    }

    if(req.query.email.match(emailRegex) == null || req.query.password.match(passwordRegex) == null){
        return res.status(400).json({ success: false, message: 'Regex tidak terpenuhi' });
    }

    const hashpassword = await bcrypt.hash(req.query.password, saltRounds);

    try {
        const result = await pg.query(
            'INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *',
            [req.query.name, req.query.email, hashpassword]
        );
    res.status(201).json({success: true, payload: result.rows[0]});
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ message: 'Fail to register' });
    }
}


// exports.login = async function login(req, res){
//     if (!req.query.email || !req.query.password) {
//         return res.status(400).json({ message: 'Tidak boleh kosong!' });
//     }

//     try {
//         const result = await pg.query(
//             'SELECT * FROM users WHERE email = $1 and password = $2',
//             [req.query.email, req.query.password]
//         );
//     if(result.rowCount == 0){
//         return res.status(400).json({ message: 'Email atau password salah' });
//     }
//     res.status(201).json(result.rows[0]);
//     } catch (error) {
//         res.status(500).json({ message: 'Fail to login' });
//     }
// }

exports.login = async function login(req, res){
    if (!req.query.email || !req.query.password) {
        return res.status(400).json({ message: 'Tidak boleh kosong!' });
    }

    try {
        const cariuser = await pg.query("SELECT * FROM users WHERE email = $1", [req.query.email]);

        if(cariuser.rowCount == 0){
            return res.status(400).json({ message: 'Akun tidak ditemukan.' });
        }
        
        const user = cariuser.rows[0];

        const isPasswordValid = await bcrypt.compare(req.query.password, user.password);

        if(!isPasswordValid){
            return res.status(400).json({ success: false, message: 'Password salah' });
        }

        return res.status(201).json({success: true, message: 'Login succes', payload: user});
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal login', payload: null});
    }
}

exports.getEmail = async function getEmail(req, res) {
    try {
        const { email } = req.params;
      const response = await pg.query("SELECT * FROM users WHERE email = $1", [email]);

      if(response.rowCount === 0){
            return res.status(404).json({message: "User not found"});
        }

      return res.status(200).json(response.rows[0]);
    } catch (error) {
        res.status(500).json(error);
    }
};

// exports.updateUser = async function updateUser(req, res) {
//     try {
//         const { email, password, name, id } = req.body;
//         const response = await pg.query("UPDATE users SET email = $1, password = $2, name = $3 WHERE id = $4", [email, password, name, id]);
        
//         //res.json(name, address);

//         if(response.rowCount === 0){
//             return res.status(404).json({message: "User not found"});
//         }

//         res.status(200).json({ message: "User data updated successfully" });
//     } catch (error) {
//         res.status(500).json({message: "fail to update user"});
//     }
// }

exports.updateUser = async function updateUser(req, res) {
    try {
        const { email, password, name, id } = req.body;
        const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Tidak boleh kosong!' });
        }
    
        if(email.match(emailRegex) == null || password.match(passwordRegex) == null){
            return res.status(400).json({ success: false, message: 'Regex tidak terpenuhi' });
        }
    
        const saltRounds = 10;
        const hashedpassword = await bcrypt.hash(password, saltRounds);

        const response = await pg.query("UPDATE users SET email = $1, password = $2, name = $3 WHERE id = $4", [email, hashedpassword, name, id]);
        
        //res.json(name, address);

        if(response.rowCount === 0){
            return res.status(404).json({message: "User not found"});
        }

        const cariuser = await pg.query("SELECT * FROM users WHERE id = $1", [id]);

        res.status(200).json({success:true, message: "User data updated successfully", payload: cariuser.rows[0]});
    } catch (error) {
        res.status(500).json({message: "fail to update user"});
    }
}

exports.deleteUser = async function deleteUser(req, res){
    try{
        const response = await pg.query("DELETE FROM users WHERE id = $1", [req.params.id]);
        if (response.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        } else {
            return res.status(200).json({ message: "User deleted successfully" });
        }
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}

exports.userTopUp = async function userTopUp(req, res) {
    try{
        const {id, amount} = req.query;

        if(amount <= 0){
            return res.status(500).json({success:false, message:"Amount must be larger than 0", payload: null});
        }

        const cariuser = await pg.query("SELECT * FROM users WHERE id = $1", [id]);
        if(cariuser.rowCount == 0){
            return res.status(404).json({ message: 'User not found' });
        }
        const user = cariuser.rows[0];

        //balance yang dibaca dari database harus diconvert ke integer pakai parseInt(). Kalau tidak, maka javascript akan menganggap balance sebagai string.
        const updatebalance = parseInt(user.balance, 10) + parseInt(amount, 10);


        await pg.query("UPDATE users SET balance = $1 WHERE id = $2", [updatebalance, id]);
        const result = await pg.query("SELECT * FROM users WHERE id = $1", [id]);

        return res.status(200).json({success:true, message:"Top up successful", payload: result.rows[0] });
    } catch(error){
        return res.status(500).json({success:false, message:"Top up gagal kids", payload: null});
    }
}