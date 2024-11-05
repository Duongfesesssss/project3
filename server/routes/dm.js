const express = require('express');
const router = express.Router();
const BookGenre = require('../models/bookGenreModel');

router.get('/', async (req, res) => {
    console.log('Received request for /api/dm_theloai_sach');
    try {
        const genres = await BookGenre.getAll(); 
        res.json(genres);
    } catch (error) {
        console.error('Error fetching book genres:', error);
        res.status(500).send('Server error.');
    }
});


module.exports = router;



/**
 * @swagger
 * tags:
 *   - name: Book Genres
 *     description: Operations related to book genres
 */

/**
 * @swagger
 * /api/dm_theloai_sach:
 *   get:
 *     tags: [Book Genres]
 *     summary: Lấy danh sách thể loại sách
 *     responses:
 *       200:
 *         description: Danh sách thể loại sách
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: 'Tiểu thuyết'
 *                   description:
 *                     type: string
 *                     example: 'Các tác phẩm văn học hư cấu'
 *       500:
 *         description: Server error
 */