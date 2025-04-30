import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import { UnauthorizedError, ForbiddenError, BadRequestError } from "../../utils/app-errors.js"; // Import custom error classes


const mock = true;
const checkRole = (requiredRoles = []) => {
    return (req, res, next) => {
        if (mock) {
            return next();
        }

        if (!req.auth) {
            return next(new UnauthorizedError("No authentication data found"));
        }

        // Extract user's roles safely
        const userRoles = req.auth["st-role"]?.v || [];

        // Check if the user has at least one required role
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return next(new ForbiddenError(`Access denied: Requires one of the roles [${requiredRoles.join(", ")}]`));
        }

        next();
    };
};

// Function to extract JWT from request
const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        //   console.log("Authorization Header Token:", authHeader);
        return authHeader.split(" ")[1];
    }

    if (req.cookies?.sAccessToken) {
        // console.log("Token from Cookies:", req.cookies.sAccessToken);
        return req.cookies.sAccessToken;
    }

    return null;
};


const checkAuth = (req, res, next) => {
    if (mock) {
        return next(); // Make sure to return to avoid further execution
    }

    jwt({
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 10 * 60 * 1000,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: "http://localhost:8080/api/v1/auth/jwt/jwks.json",
        }),
        algorithms: ["RS256"],
        getToken: getTokenFromRequest,
    })(req, res, (err) => {
        if (err) {
            // Handle different errors appropriately
            if (err.name === "UnauthorizedError") {
                console.log("we are here ");
                return next(new UnauthorizedError("Invalid authentication token"));
            }
            if (err.code === "credentials_required") {
                return next(new BadRequestError("Authentication token is missing"));
            }
            if (err.code === "permission_denied") {
                return next(new ForbiddenError("You do not have permission to access this resource"));
            }
            return next(new UnauthorizedError("Authentication failed"));
        }
        // If no error, continue to the next middleware or route handler
        return next();
    });
};


const getUserId = (auth) => {
    if (mock) {
        return 'asdfa2342fasrq23fwe234fasd';
    }
    if (!auth || !auth.sub) {
        console.warn("Missing user ID in authentication data");
        return null;
    }
    return auth.sub; // `sub` contains the user ID
};


const getCurrentRole = (auth) => {
    if (mock) {
        return 'STUDENT';
    }
    if (!auth || !auth.sub) {
        console.warn("Missing user Role in authentication data");
        return null;
    }

    //return auth.sub; // `sub` contains the user ID
    return auth.role;
}

export { checkRole, getUserId, getCurrentRole, checkAuth };
