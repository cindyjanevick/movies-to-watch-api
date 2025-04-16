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
      const movieId = "valid_movie_id"; // Replace with a valid movie ID from your DB
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

  describe("POST - Create a movie", () => {
    it("should create a movie", async () => {
      const newMovie = {
        title: "New Movie",
        description: "A new movie description",
        genre: "Action",
        releaseYear: 2025,
      };

      const response = await request(app).post("/movies").send(newMovie);
      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(newMovie.title);
    });

    it("should return error for missing fields", async () => {
      const invalidMovie = { title: "" }; // Missing required fields
      const response = await request(app).post("/movies").send(invalidMovie);
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT - Update a movie", () => {
    it("should update a movie", async () => {
      const updatedMovie = {
        title: "Updated Movie Title",
        description: "Updated description",
      };

      const response = await request(app).put("/movies/valid_movie_id").send(updatedMovie);
      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe(updatedMovie.title);
    });

    it("should return error for invalid movie ID", async () => {
      const invalidMovie = {
        title: "Updated Movie Title",
        description: "Updated description",
      };

      const invalidId = "invalid_id";
      const response = await request(app).put(`/movies/${invalidId}`).send(invalidMovie);
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE - Delete a movie", () => {
    it("should delete a movie", async () => {
      const movieId = "valid_movie_id"; // Replace with a valid movie ID from DB
      const response = await request(app).delete(`/movies/${movieId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message", "Movie deleted successfully");
    });

    it("should return error for invalid movie ID", async () => {
      const invalidId = "invalid_id";
      const response = await request(app).delete(`/movies/${invalidId}`);
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });
});

describe("Users Route", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/users");
    expect(response.body).toBeInstanceOf(Array);
    expect(response.statusCode).toBe(200);
  });

  it("should return error for invalid user ID", async () => {
    const invalid_id = "invalid_id";
    const response = await request(app).get(`/users/${invalid_id}`);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Invalid User ID format");
    expect(response.statusCode).toBe(400);
  });
});

describe("Reviews Route", () => {
  it("should return all reviews", async () => {
    const response = await request(app).get("/reviews");
    expect(response.body).toBeInstanceOf(Array);
    expect(response.statusCode).toBe(200);
  });

  it("should return error for invalid review ID", async () => {
    const invalid_id = "invalid_id";
    const response = await request(app).get(`/reviews/${invalid_id}`);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Invalid Review ID format");
    expect(response.statusCode).toBe(400);
  });

  it("should return error when trying to create review with invalid data", async () => {
    const invalid_review = { title: "", rating: "" };
    const response = await request(app).post("/reviews").send(invalid_review);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.error).toBe("An error occurred while creating the Review");
    expect(response.statusCode).toBe(500);
  });

  it("should return error when trying to update review with invalid data", async () => {
    const invalid_review = { title: "", rating: "" };
    const invalid_id = "invalid_id";
    const response = await request(app).put(`/reviews/${invalid_id}`).send(invalid_review);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.error).toBe("An error occurred while updating the Review");
    expect(response.statusCode).toBe(500);
  });
});

describe("Watchlists Route", () => {
  it("should return all watchlists", async () => {
    const response = await request(app).get("/watchlists");
    expect(response.body).toBeInstanceOf(Array);
    expect(response.statusCode).toBe(200);
  });

  it("should create a watchlist", async () => {
    const newWatchlist = { name: "My Watchlist" };
    const response = await request(app).post("/watchlists").send(newWatchlist);
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe(newWatchlist.name);
  });

  it("should return error for invalid watchlist data", async () => {
    const invalidWatchlist = { name: "" };
    const response = await request(app).post("/watchlists").send(invalidWatchlist);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should update a watchlist", async () => {
    const updatedWatchlist = { name: "Updated Watchlist" };
    const response = await request(app).put("/watchlists/valid_watchlist_id").send(updatedWatchlist);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe(updatedWatchlist.name);
  });

  it("should delete a watchlist", async () => {
    const watchlistId = "valid_watchlist_id"; // Replace with valid watchlist ID
    const response = await request(app).delete(`/watchlists/${watchlistId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "Watchlist deleted successfully");
  });
});
