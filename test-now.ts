import { birthdayWorkflow } from './src/mastra/workflows/birthdayWorkflow';

async function testNow() {
  console.log('🎂 Running birthday workflow now...');
  
  try {
    const result = await birthdayWorkflow.execute({});
    console.log('\n✅ Workflow completed!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Workflow failed:', error);
  }
}

testNow();
