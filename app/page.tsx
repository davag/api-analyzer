import Link from "next/link";
import Layout from "./components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 my-8">
        <h2 className="text-2xl font-bold mb-6">Analyze Your API Specification</h2>
        
        <div className="mb-8">
          <p className="mb-4">Upload your API specification to get detailed quality analysis:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Documentation completeness score</li>
            <li>Schema & syntax validation</li>
            <li>Best practices analysis</li>
            <li>Security configuration review</li>
            <li>Overall quality rating</li>
          </ul>
        </div>

        <div className="space-y-6">
          <Link 
            href="/upload"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-md transition duration-300"
          >
            Upload Specification
          </Link>
        </div>
      </div>
    </Layout>
  );
}
