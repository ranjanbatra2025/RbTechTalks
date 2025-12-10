import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('No session ID');
      const { data } = await supabase
        .from('enrollments')
        .select('course_id, status')
        .eq('stripe_session_id', sessionId)
        .single();
      return data;
    },
    enabled: !!sessionId,
  });

  if (enrollment?.status === 'paid') {
    return (
      <div className="py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Enrollment Successful!</h1>
        <p>You now have access to your course.</p>
        <Link to="/courses" className="btn-primary mt-4">View My Courses</Link>
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default SuccessPage;