/**
 * Simple test to check if Post model works
 */
import '../utils/loadEnv';
import Post from '../models/Post';

async function testPosts() {
  try {
    console.log('Testing Post model...');
    const count = await Post.count({ where: { status: 'published' } });
    console.log(`Found ${count} published posts`);
    
    const posts = await Post.findAll({
      where: { status: 'published' },
      limit: 5,
    });
    console.log(`Fetched ${posts.length} posts`);
    
    if (posts.length > 0) {
      console.log('First post:', JSON.stringify(posts[0].toJSON(), null, 2));
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

testPosts();

















