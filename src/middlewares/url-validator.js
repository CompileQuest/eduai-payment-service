const validateUrls = (req, res, next) => {

    const { success_url, cancel_url } = req.body;
    console.log("this si the success url ", success_url);
    console.log("this si the cnacle url ", cancel_url)

    try {

        if (!success_url || !cancel_url) {

            throw new Error('Both success_url and cancel_url are required');

        }



        // Validate URL format

        new URL(success_url);

        new URL(cancel_url);



        next();

    } catch (error) {

        res.status(400).json({

            error: 'Invalid URL format or missing URLs'

        });

    }

};


export default validateUrls;