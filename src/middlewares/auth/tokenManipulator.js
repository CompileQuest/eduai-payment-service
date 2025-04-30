const tokenManipulator = (mode = "none") => {
    return (req, res, next) => {
        console.log("Token Manipulator - Initial State:");
        console.log("Authorization Header:", req.headers.authorization);
        console.log("Cookies:", req.cookies);

        if (mode === "delete") {
            // Clear authorization header
            delete req.headers.authorization;

            // Clear all token-related cookies
            // res.clearCookie('sAccessToken');
            //  res.clearCookie('sFrontToken');

            // Explicitly remove token from request
            delete req.cookies.sAccessToken;
            delete req.cookies.sFrontToken;

            console.log("Token Deleted:");
            console.log("Authorization Header After Deletion:", req.headers.authorization);
            console.log("Cookies After Deletion:", req.cookies);
        }

        next();
    };
};

export default tokenManipulator;