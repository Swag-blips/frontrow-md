import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com', // Replace with your actual API base URL
});

// Mocking the endpoint for demonstration
// You would remove this and use your actual API
import MockAdapter from 'axios-mock-adapter';
const mock = new MockAdapter(api, { delayResponse: 1000 });

mock.onGet('/recent-products').reply(200, {
  products: [
    {
      id: 1,
      name: 'CeraVe Hydrating Facial Cleanser',
      url: 'cerave.com',
      imageUrl: 'https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/americas/us/product-images/hydrating-facial-cleanser/cerave_hydrating_cleanser_24oz_front_v2.jpg',
    },
    {
        id: 2,
        name: 'La Roche-Posay Hyalu B5 Serum',
        url: 'laroche-posay.us',
        imageUrl: 'https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lrp-master-catalog/default/dw05631795/2023-upd/full-size/front/lp-b5-serum-30ml-3337875850942-front.jpg?sw=380&sh=450&sm=stretch&q=70',
    },
    {
        id: 3,
        name: 'SkinCeuticals C E Ferulic',
        url: 'skinceuticals.com',
        imageUrl: 'https://www.skinceuticals.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-skc-master-catalog/default/dw9e722a40/2024-upd/350/CE-Ferulic-30ml-3606000527236-front.jpg?sw=380&sh=450&sm=stretch&q=70',
    }
  ],
});


export const getRecentProducts = () => api.get('/recent-products');

export default api; 