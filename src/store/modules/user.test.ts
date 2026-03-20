import userModule from './user';
import * as types from '../types';

describe('user store module', () => {
  // 创建 state 副本，避免测试间的污染
  const createState = () => {
    return JSON.parse(JSON.stringify(userModule.state));
  };

  describe('mutations', () => {
    it('SAVE_USER 应该能更新 state 中的用户信息', () => {
      // 获取初始 state
      const state = createState();
      
      expect(state.userInfo).toEqual({
        _id: '',
        name: '',
        avatar: ''
      });

      // 调用 mutation
      const newUserInfo = {
        userInfo: {
          _id: '12345',
          name: 'Test User',
          avatar: 'http://example.com/avatar.jpg'
        }
      };

      userModule.mutations[types.SAVE_USER](state, newUserInfo);

      // 验证 state 是否已更新
      expect(state.userInfo).toEqual({
        _id: '12345',
        name: 'Test User',
        avatar: 'http://example.com/avatar.jpg'
      });
    });

    it('SAVE_USER 应该能部分更新用户信息', () => {
      const state = createState();
      
      // 先设置完整的用户信息
      userModule.mutations[types.SAVE_USER](state, {
        userInfo: {
          _id: '12345',
          name: 'Test User',
          avatar: 'http://example.com/avatar.jpg'
        }
      });

      // 只更新 name 字段
      userModule.mutations[types.SAVE_USER](state, {
        userInfo: {
          _id: '12345',
          name: 'Updated Name',
          avatar: 'http://example.com/avatar.jpg'
        }
      });

      expect(state.userInfo.name).toBe('Updated Name');
      expect(state.userInfo._id).toBe('12345');
      expect(state.userInfo.avatar).toBe('http://example.com/avatar.jpg');
    });

    it('SAVE_USER 应该能添加新的属性到 state', () => {
      const state = createState();
      
      // 添加一个新属性
      const newState = {
        userInfo: {
          _id: '12345',
          name: 'Test User',
          avatar: 'http://example.com/avatar.jpg'
        },
        token: 'test-token-123'
      };

      userModule.mutations[types.SAVE_USER](state, newState);

      expect((state as any).token).toBe('test-token-123');
      expect(state.userInfo._id).toBe('12345');
    });
  });

  describe('state', () => {
    it('初始 state 应该有正确的默认值', () => {
      const state = userModule.state;
      
      expect(state).toEqual({
        userInfo: {
          _id: '',
          name: '',
          avatar: ''
        }
      });
    });
  });
});
