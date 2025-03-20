//wkwkwk ty technoskill 1.0

const pg = require("../utils/connect");
const cloudinary = require("cloudinary").v2;


const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});


exports.createItem = async function createItem(req, res) {
    const { name, price, store_id, stock } = req.body;
    const image = req.file;

    try {
        if (!image) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        //pakai upload stream katanya biar diupload langsung ke cloudinary.
        const uploadResult = await cloudinary.uploader.upload_stream(
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'Error uploading image to Cloudinary', error });
                }

                // Save the image URL from Cloudinary
                const imageUrl = result.secure_url;

                try {
                    const queryResult = await pg.query(
                        'INSERT INTO items(name, price, store_id, image_url, stock) VALUES($1, $2, $3, $4, $5) RETURNING *',
                        [name, price, store_id, imageUrl, stock]
                    );
                    res.status(201).json({ success: true, message: 'Item created', payload: queryResult.rows[0] });
                } catch (error) {
                    return res.status(500).json({ success: false, message: 'Internal Server error or Store not found', payload: null });
                }
            }
        );

        // Upload the file buffer to Cloudinary
        uploadResult.end(image.buffer);

    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error', payload: null });
    }
};

exports.getAllItem = async function getAllItem(req, res) {
    try {
        const result = await pg.query('SELECT * FROM items');
        res.status(200).json({success: true, message: 'Items found', payload: result.rows});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error', payload: null });
    }
}

exports.getItemById = async function getItemById(req, res) {
    try {
        const { id } = req.params;
      const response = await pg.query("SELECT * FROM items WHERE id = $1", [id]);

      if(response.rowCount === 0){
            return res.status(404).json({message: "Item not found"});
        }

      return res.status(200).json({success: true, message: 'Item found', payload: response.rows[0]});
    } catch (error) {
        res.status(500).json({success: false, message: 'Item not found', payload: null});
    }
};

exports.getItemByStoreId = async function getItemByStoreId(req, res) {
    try {
        const { store_id } = req.params;
      const response = await pg.query("SELECT * FROM items WHERE store_id = $1", [store_id]);

      if(response.rowCount === 0){
            return res.status(404).json({success:true, message: "Item not found", payload: null});
        }

      return res.status(200).json({success: 'true', message: 'Item found', payload: response.rows});
    } catch (error) {
        return res.status(500).json({success: false, message: 'Store not found', payload: null});
    }
}

exports.updateItem = async function updateItem(req, res) {
    try {
        const { id, name, price, store_id, stock } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const uploadResult = await cloudinary.uploader.upload_stream(
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'Error uploading image to Cloudinary', error });
                }

                const imageUrl = result.secure_url;

                try {
                    const queryResult = await pg.query(
                        'UPDATE items SET name = $1, price = $2, store_id = $3, image_url = $4, stock = $5 WHERE id = $6 RETURNING *',
                        [name, price, store_id, imageUrl, stock, id]
                    );
                    res.status(200).json({ success: true, message: 'Item updated', payload: queryResult.rows[0] });
                } catch (error) {
                    return res.status(500).json({ success: false, message: 'Store or Item not found', payload: null });
                }
            }
        );

        uploadResult.end(image.buffer);

    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error', payload: null });
    }
}

exports.deleteItem = async function deleteItem(req, res) {
    try {
        const { id } = req.params;

        //cek apakah item ada sebelum delete
        const print = await pg.query("SELECT * FROM items WHERE id = $1", [id]);
        
        if (print.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Item not found", payload: null });
        }
        const itemToDelete = print.rows[0];
        
        const response = await pg.query("DELETE FROM items WHERE id = $1", [id]);
        if (response.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }
        res.status(200).json({success: true, message: "Item deleted successfully", payload: itemToDelete});

    } catch (error) {
        return res.status(404).json({ success: false, message: "Item not found", payload: null });
    }
};