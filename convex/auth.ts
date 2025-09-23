import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const authenticateUser = httpAction(async (ctx, request) => {
  const { email, password } = await request.json();

  try {
    console.log('🔍 Authenticating user via HTTP action:', email);

    // Use internal query to get user
    const user = await ctx.runQuery(internal.users.getByEmailInternal, { email });

    if (!user) {
      console.log('❌ User not found');
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log('👤 User found, returning data');

    return new Response(JSON.stringify({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        password: user.password // Include password for bcrypt comparison
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('❌ Auth HTTP action error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});