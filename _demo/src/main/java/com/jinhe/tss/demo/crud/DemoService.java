package com.jinhe.tss.demo.crud;

import java.util.List;

import com.jinhe.tss.framework.component.log.Logable;
import com.jinhe.tss.framework.persistence.pagequery.PageInfo;
 
public interface DemoService {

	DemoEntity getEntityById(Long id);
	
	List<DemoEntity> getAllEntities();

	@Logable(operateObject="DemoEntity", operateInfo="新增了一个DemoEntity：${returnVal?default(\"\")}")
	DemoEntity create(DemoEntity entity);
	
	@Logable(operateObject="DemoEntity", operateInfo="修改了DemoEntity，修改后的值为：${returnVal?default(\"\") }")
	DemoEntity update(DemoEntity entity);
	
	@Logable(operateObject="DemoEntity", operateInfo="删除了DemoEntity（ID=${args[0]?default(\"\")})")
	DemoEntity delete(Long id);
	
	PageInfo search(DemoSO so);
}

