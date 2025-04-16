const request = require('supertest');
const app = require('../server'); // Assuming your server file is named server.js
const mongodb = require('../data/database'); // Import the database connection (adjust path if needed)

beforeAll((done) => {
  mongodb.initDb((err) => {
    if (err) {
      done(err); // Failure if there's an error during DB initialization
    } else {
      done(); // Success
    }
  });
});

afterAll((done) => {
  const client = mongodb.getDatabase();
  if (client) {
    client.close().then(() => done()).catch((err) => done(err));
  } else {
    done();
  }
});

describe("Movies Route", () => {
  describe("GET all movies", () => {
    it("should return all movies", async () => {
      const response = await request(app).get("/movies");
      const movie = response.body[0];
      expect(movie).toBeInstanceOf(Object);
      expect(movie).not.toBeNull();
      expect(movie.title).toBe('The Dark Knight'); // Adjust this to the expected movie title in DB
      expect(response.statusCode).toBe(200);
    });
  });

  describe("GET a single movie by ID", () => {
    it("should return a movie by ID", async () => {
      const movieId = "67ec23822403ed55b2a9833e"; // Replace with a valid movie ID from your DB
      const response = await request(app).get(`/movies/${movieId}`);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.title).toBe('Inception'); // Replace with actual movie title
      expect(response.statusCode).toBe(200);
    });

    it("should return error for invalid ID", async () => {
      const invalid_id = "invalid_id";
      const response = await request(app).get(`/movies/${invalid_id}`);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Invalid movie ID format");
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Users Route", () => {
    describe("GET all users", () => {
      it("should return all users", async () => {
        const response = await request(app).get("/users");
        const user = response.body[0];
        expect(user).toBeInstanceOf(Object);
        expect(user).not.toBeNull();
        expect(user).toHaveProperty("username"); // Adjust based on your schema
        expect(response.statusCode).toBe(200);
      });
    });
  
    describe("GET a single user by ID", () => {
      it("should return a user by ID", async () => {
        const userId = "67ec22f72403ed55b2a9833c"; // Replace with a real ID
        const response = await request(app).get(`/users/${userId}`);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("username"); // Adjust as needed
        expect(response.statusCode).toBe(200);
      });
  
      it("should return error for invalid ID", async () => {
        const response = await request(app).get("/users/invalid_id");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Invalid User ID format");
        expect(response.statusCode).toBe(400);
      });
    });
  });
   
  describe("Reviews Route", () => {
    describe("GET all reviews", () => {
      it("should return all reviews", async () => {
        const response = await request(app).get("/reviews");
        const review = response.body[0];
        expect(review).toBeInstanceOf(Object);
        expect(review).not.toBeNull();
        expect(review).toHaveProperty("rating"); // Adjust according to your schema
        expect(review).toHaveProperty("comment"); // Example property
        expect(response.statusCode).toBe(200);
      });
    });
  
    describe("GET a single review by ID", () => {
      it("should return a review by ID", async () => {
        const reviewId = "67ff3ae8eab4bfb9341e74b1"; // Replace with a valid review ID
        const response = await request(app).get(`/reviews/${reviewId}`);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("comment"); // Adjust as needed
        expect(response.body).toHaveProperty("rating"); // Adjust as needed
        expect(response.statusCode).toBe(200);
      });
  
      it("should return error for invalid ID", async () => {
        const response = await request(app).get("/reviews/invalid_id");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Invalid review ID format");
        expect(response.statusCode).toBe(400);
      });
    });
  });
  describe("Watchlists Route", () => {
    describe("GET all watchlists", () => {
      it("should return all watchlists", async () => {
        const response = await request(app).get("/watchlists");
        const watchlist = response.body[0];
        expect(watchlist).toBeInstanceOf(Object);
        expect(watchlist).not.toBeNull();
        expect(watchlist).toHaveProperty("user_id");
        expect(Array.isArray(watchlist.movies)).toBe(true);
        expect(response.statusCode).toBe(200);
      });
    });
  
    describe("GET a single watchlist by ID", () => {
      it("should return a watchlist by ID", async () => {
        const watchlistId = "67fe0b07ea2e7e16c9d4420c"; // Use valid ID from your DB
        const response = await request(app).get(`/watchlists/${watchlistId}`);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("user_id");
        expect(response.body).toHaveProperty("movies");
        expect(Array.isArray(response.body.movies)).toBe(true);
        expect(response.statusCode).toBe(200);
      });
  
      it("should return error for invalid ID", async () => {
        const response = await request(app).get("/watchlists/invalid_id");
        expect(response.body).toHaveProperty("error");
        expect(response.body.error).toBe("Invalid Watchlist ID format");
        expect(response.statusCode).toBe(400);
      });
    });
  });
  
  
})