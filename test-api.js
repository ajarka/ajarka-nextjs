// Test script for mentor availability API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🚀 Testing Mentor Availability API Endpoints...\n');

  try {
    // Test 1: GET all availabilities
    console.log('1️⃣ Testing GET /mentor_availability');
    const getResponse = await fetch(`${BASE_URL}/mentor_availability`);
    if (getResponse.ok) {
      const availabilities = await getResponse.json();
      console.log(`   ✅ Success: Found ${availabilities.length} availability records`);
    } else {
      console.log(`   ❌ Failed: HTTP ${getResponse.status}`);
    }

    // Test 2: POST new availability
    console.log('\n2️⃣ Testing POST /mentor_availability');
    const newAvailability = {
      mentorId: 1,
      scheduleId: 1,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '12:00',
      isRecurring: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const postResponse = await fetch(`${BASE_URL}/mentor_availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAvailability)
    });

    if (postResponse.ok) {
      const created = await postResponse.json();
      console.log(`   ✅ Success: Created availability with ID ${created.id}`);
      
      // Test 3: PUT update availability
      console.log('\n3️⃣ Testing PUT /mentor_availability/:id');
      const updatedData = {
        ...created,
        startTime: '10:00',
        endTime: '13:00',
        updatedAt: new Date().toISOString()
      };

      const putResponse = await fetch(`${BASE_URL}/mentor_availability/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (putResponse.ok) {
        const updated = await putResponse.json();
        console.log(`   ✅ Success: Updated availability ${updated.id}`);
        console.log(`   📝 Time changed to ${updated.startTime} - ${updated.endTime}`);
        
        // Test 4: DELETE availability
        console.log('\n4️⃣ Testing DELETE /mentor_availability/:id');
        const deleteResponse = await fetch(`${BASE_URL}/mentor_availability/${created.id}`, {
          method: 'DELETE'
        });

        if (deleteResponse.ok) {
          console.log(`   ✅ Success: Deleted availability ${created.id}`);
        } else {
          console.log(`   ❌ Failed to delete: HTTP ${deleteResponse.status}`);
        }
      } else {
        console.log(`   ❌ Failed to update: HTTP ${putResponse.status}`);
      }
    } else {
      console.log(`   ❌ Failed to create: HTTP ${postResponse.status}`);
    }

    // Test 5: Test with invalid data
    console.log('\n5️⃣ Testing error handling');
    const invalidResponse = await fetch(`${BASE_URL}/mentor_availability/99999`);
    if (invalidResponse.status === 404) {
      console.log('   ✅ Success: Correctly returns 404 for non-existent ID');
    } else {
      console.log(`   ❓ Unexpected response for invalid ID: HTTP ${invalidResponse.status}`);
    }

    console.log('\n🎉 API tests completed!');

  } catch (error) {
    console.log(`\n❌ Test failed with error: ${error.message}`);
    console.log('💡 Make sure JSON server is running on port 3001');
    console.log('💡 Run: npm run dev:server or npx json-server --watch db.json --port 3001');
  }
}

// Run the tests
testAPI();