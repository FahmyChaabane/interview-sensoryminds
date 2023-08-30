import { createClient } from "redis";

export const launchRedisClient = async () => {
    // default to localhost on port 6379
    const redisClient = createClient();
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
    return redisClient
}
 
