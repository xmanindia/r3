import MyBuilderCaption      from './builderCaption.js';
import MyBuilderIconInput    from './builderIconInput.js';
import {getDependentModules} from '../shared/builder.js';
import {copyValueDialog}     from '../shared/generic.js';
import {
	getAttributeIcon,
	isAttributeBoolean,
	isAttributeFiles,
	isAttributeFloat,
	isAttributeInteger,
	isAttributeNumeric,
	isAttributeRegconfig,
	isAttributeRelationship,
	isAttributeRelationship11,
	isAttributeRelationshipN1,
	isAttributeString,
	isAttributeUuid
} from '../shared/attribute.js';
export {MyBuilderAttribute as default};

let MyBuilderAttribute = {
	name:'my-builder-attribute',
	components:{
		MyBuilderCaption,
		MyBuilderIconInput
	},
	template:`<div class="app-sub-window under-header" @mousedown.self="$emit('close')">
		<div class="contentBox builder-attribute pop-up" v-if="values !== null">
			<div class="top">
				<div class="area nowrap">
					<img class="icon" :src="'images/'+getAttributeIcon(values,false)" />
					<h1 class="title">{{ title }}</h1>
				</div>
				<div class="area">
					<my-button image="cancel.png"
						@trigger="$emit('close')"
						:cancel="true"
					/>
				</div>
			</div>
			<div class="top lower">
				<div class="area">
					<my-button image="save.png"
						@trigger="set"
						:active="canSave"
						:caption="isNew ? capGen.button.create : capGen.button.save"
					/>
					<my-button image="refresh.png"
						@trigger="reset"
						:active="hasChanges"
						:caption="capGen.button.refresh"
					/>
					<my-button image="delete.png"
						v-if="!isNew"
						@trigger="delAsk"
						:active="!readonly"
						:cancel="true"
						:caption="capGen.button.delete"
					/>
				</div>
			</div>
			
			<div class="content default-inputs">
				<table class="generic-table-vertical">
					<tr>
						<td>{{ capGen.name }}</td>
						<td>
							<div class="row gap centered">
								<input v-focus v-model="values.name" :disabled="readonly || isId" />
								<my-button image="visible1.png"
									@trigger="copyValueDialog(values.name,attributeId,attributeId)"
									:active="!isNew"
									:caption="capGen.id"
								/>
							</div>
						</td>
						<td>{{ capApp.nameHint }}</td>
					</tr>
					<tr>
						<td>{{ capGen.title }}</td>
						<td>
							<div class="row gap centered">
								<my-builder-caption
									v-model="values.captions.attributeTitle"
									:language="builderLanguage"
									:readonly="readonly"
								/>
								<my-button image="languages.png"
									@trigger="$emit('next-language')"
									:active="module.languages.length > 1"
								/>
							</div>
						</td>
						<td>{{ capApp.titleHint }}</td>
					</tr>
					<tr>
						<td>{{ capGen.icon }}</td>
						<td>
							<my-builder-icon-input
								@input="values.iconId = $event"
								:iconIdSelected="values.iconId"
								:module="module"
								:readonly="readonly"
							/>
						</td>
						<td>{{ capApp.iconHint }}</td>
					</tr>
					<tr v-if="!isId">
						<td>{{ capApp.usedFor }}</td>
						<td>
							<div class="row centered gap">
								<select v-model="usedFor" :disabled="readonly">
									<optgroup :label="capGen.standard">
										<option value="text"     :disabled="!isNew && !isString">{{ capApp.option.text }}</option>
										<option value="textarea" :disabled="!isNew && !isString">{{ capApp.option.textarea }}</option>
										<option value="richtext" :disabled="!isNew && !isString">{{ capApp.option.richtext }}</option>
										<option value="number"   :disabled="!isNew && !isInteger">{{ capApp.option.number }}</option>
										<option value="decimal"  :disabled="!isNew && !isNumeric">{{ capApp.option.decimal }}</option>
										<option value="color"    :disabled="!isNew && !isString">{{ capApp.option.color }}</option>
										<option value="files"    :disabled="!isNew && !isFiles">{{ capApp.option.files }}</option>
										<option value="boolean"  :disabled="!isNew && !isBoolean">{{ capApp.option.boolean }}</option>
									</optgroup>
									<optgroup :label="capApp.datetimes" :disabled="!isNew && !isInteger">
										<option value="datetime">{{ capApp.option.datetime }}</option>
										<option value="date">{{ capApp.option.date }}</option>
										<option value="time">{{ capApp.option.time }}</option>
									</optgroup>
									<optgroup :label="capGen.relationships" :disabled="!isNew && !isRelationship">
										<option value="relationshipN1">{{ capApp.option.relationshipN1 }}</option>
										<option value="relationship11">{{ capApp.option.relationship11 }}</option>
									</optgroup>
									<optgroup :label="capApp.expert" :disabled="!isNew && !isFloat && !isUuid">
										<option value="float"     :disabled="!isNew && !isFloat">{{ capApp.option.float }}</option>
										<option value="uuid"      :disabled="!isNew && !isUuid">{{ capApp.option.uuid }}</option>
										<option value="regconfig" :disabled="!isNew && !isRegconfig">{{ capApp.option.regconfig }}</option>
									</optgroup>
								</select>
								<my-button
									:active="false"
									:image="getAttributeIcon(values,false)"
									:naked="true"
								/>
							</div>
						</td>
						<td>{{ capApp['usedForHint'][usedFor] }}</td>
					</tr>
					
					<!-- bigint -->
					<tr v-if="isInteger && !isTime">
						<td>{{ isDate || isDatetime ? capApp.bigintDates : capApp.bigint }}</td>
						<td><my-bool v-model="bigint" :readonly="readonly" /></td>
						<td>{{ isDate || isDatetime ? capApp.bigintDatesHint : capApp.bigintHint }}</td>
					</tr>
					
					<!-- double precision -->
					<tr v-if="isFloat">
						<td>{{ capApp.doublePrecision }}</td>
						<td><my-bool v-model="doublePrecision" :readonly="readonly" /></td>
						<td>{{ capApp.doublePrecisionHint }}</td>
					</tr>
					
					<!-- text/files length -->
					<tr v-if="hasLength">
						<td>{{ isString ? capApp.lengthText : capApp.lengthFiles }}</td>
						<td>
							<input type="number"
								@keyup="updateLength"
								v-model="values.length"
								:disabled="readonly"
							/>
						</td>
						<td></td>
					</tr>
					
					<!-- encrypted -->
					<tr v-if="canEncrypt">
						<td>{{ capApp.encrypted }}</td>
						<td><my-bool v-model="values.encrypted" :readonly="readonly" /></td>
						<td>{{ capApp.encryptedHint }}</td>
					</tr>
					
					<!-- nullable -->
					<tr v-if="!isId">
						<td>{{ capApp.nullable }}</td>
						<td><my-bool v-model="values.nullable" :readonly="readonly || isId" :reversed="true" /></td>
						<td>{{ capApp.nullableHint }}</td>
					</tr>
					
					<!-- defaults -->
					<tr v-if="!isId && !isFiles && !isRelationship">
						<td>{{ capApp.defaults }}</td>
						<td>
							<div class="column centered gap">
								<select v-model="defaultsOption" @change="updateDefaultsOption" :disabled="readonly">
									<option value="fixed">{{ capApp.option.defaults.fixed }}</option>
									<option value="date"     :disabled="!isDate">{{ capApp.option.defaults.date }}</option>
									<option value="datetime" :disabled="!isDatetime">{{ capApp.option.defaults.datetime }}</option>
									<option value="uuid"     :disabled="!isUuid">{{ capApp.option.defaults.uuid }}</option>
								</select>
								<input placeholder="..."
									v-if="defaultsOption === 'fixed'"
									v-model="values.def"
									:disabled="readonly"
								/>
							</div>
						</td>
						<td>{{ capApp.defaultsHint }}</td>
					</tr>
					
					<!-- relationship settings -->
					<template v-if="isRelationship">
						<tr>
							<td>{{ capApp.relationshipId }}</td>
							<td>
								<select
									v-model="values.relationshipId"
									:disabled="!isNew || readonly"
								>
									<option :value="null">-</option>
									<option v-for="rel in module.relations" :value="rel.id">
										{{ rel.name }}
									</option>
									
									<!-- relations from other modules -->
									<optgroup
										v-for="mod in getDependentModules(module,modules).filter(v => v.id !== module.id && v.relations.length !== 0)"
										:label="mod.name"
									>
										<option v-for="rel in mod.relations" :value="rel.id">
											{{ mod.name + ': ' + rel.name }}
										</option>
									</optgroup>
								</select>
							</td>
							<td></td>
						</tr>
						<tr>
							<td>{{ capApp.onUpdate }}</td>
							<td>
								<select v-model="values.onUpdate" :disabled="readonly">
									<option value="NO ACTION">NO ACTION</option>
									<option value="CASCADE">CASCADE</option>
									<option value="SET NULL">SET NULL</option>
									<option value="RESTRICT">RESTRICT</option>
								</select>
							</td>
							<td></td>
						</tr>
						<tr>
							<td>{{ capApp.onDelete }}</td>
							<td>
								<select v-model="values.onDelete" :disabled="readonly">
									<option value="NO ACTION">NO ACTION</option>
									<option value="CASCADE">CASCADE</option>
									<option value="SET NULL">SET NULL</option>
									<option value="RESTRICT">RESTRICT</option>
								</select>
							</td>
							<td></td>
						</tr>
					</template>
					
					<!-- expert info -->
					<tr>
						<td>{{ capApp.content }}</td>
						<td><input :value="values.content" disabled="disabled" /></td>
						<td>{{ capApp.contentHint }}</td>
					</tr>
				</table>
			</div>
		</div>
	</div>`,
	props:{
		attributeId:    { required:true },
		builderLanguage:{ type:String,  required:true },
		readonly:       { type:Boolean, required:true },
		relation:       { type:Object,  required:true }
	},
	emits:['close','next-language'],
	data() {
		return {
			defaultsOption:'fixed',
			
			// attribute values
			values:null,
			valuesOrg:null
		};
	},
	computed:{
		// indirect inputs (update attribute values)
		bigint:{
			get()  { return this.values.content === 'bigint'; },
			set(v) { this.values.content = v ? 'bigint' : 'integer'; }
		},
		doublePrecision:{
			get()  { return this.values.content === 'double precision'; },
			set(v) { this.values.content = v ? 'double precision' : 'real'; }
		},
		usedFor:{
			get() {
				if(this.isBoolean)   return 'boolean';
				if(this.isColor)     return 'color';
				if(this.isDate)      return 'date';
				if(this.isDatetime)  return 'datetime';
				if(this.isNumber)    return 'number';
				if(this.isNumeric)   return 'decimal';
				if(this.isFiles)     return 'files';
				if(this.isFloat)     return 'float';
				if(this.isRegconfig) return 'regconfig';
				if(this.isRichtext)  return 'richtext';
				if(this.isText)      return 'text';
				if(this.isTextarea)  return 'textarea';
				if(this.isTime)      return 'time';
				if(this.isUuid)      return 'uuid';
				if(this.isRelationship11) return 'relationship11';
				if(this.isRelationshipN1) return 'relationshipN1';
				
				return 'text';
			},
			set(v) {
				switch(v) {
					// text uses
					case 'richtext': // fallthrough
					case 'text':     // fallthrough
					case 'textarea':
						if(this.isNew) {
							this.values.content = 'text';
							this.values.length  = 0;
						}
						// textarea/richtext are specific content uses
						this.values.contentUse = v === 'text' ? 'default' : v;
					break;
					case 'color':
						this.values.content    = 'varchar';
						this.values.contentUse = 'color';
						this.values.length     = 6;
					break;
					
					// boolean uses
					case 'boolean':
						this.values.content    = 'boolean';
						this.values.contentUse = 'default';
					break;
					
					// integer uses
					case 'date':     // fallthrough
					case 'datetime': // fallthrough
					case 'time':
						if(this.isNew)
							this.values.content = v === 'time' ? 'integer' : 'bigint';
						
						this.values.contentUse = v;
					break;
					case 'number':
						this.values.content    = this.isNew ? 'integer' : this.values.content;
						this.values.contentUse = 'default';
					break;
					
					// numeric uses
					case 'decimal':
						this.values.content    = 'numeric';
						this.values.contentUse = 'default';
					break;
					
					// files uses
					case 'files':
						this.values.content    = 'files';
						this.values.contentUse = 'default';
					break;
					
					// float uses
					case 'float':
						this.values.content    = this.isNew ? 'real' : this.values.content;
						this.values.contentUse = 'default';
					break;
					
					// relationship uses
					case 'relationship11': // fallthrough
					case 'relationshipN1':
						this.values.content    = v === 'relationship11' ? '1:1' : 'n:1';
						this.values.contentUse = 'default';
					break;
					
					// regconfig uses
					case 'regconfig':
						this.values.content    = 'regconfig';
						this.values.contentUse = 'default';
					break;
					
					// UUID uses
					case 'uuid':
						this.values.content    = 'uuid';
						this.values.contentUse = 'default';
					break;
				}
				
				// reset defaults
				this.values.def     = '';
				this.defaultsOption = 'fixed';
			}
		},
		
		// simple
		canEncrypt:    (s) => s.relation.encryption && s.values.content === 'text',
		canSave:       (s) => !s.readonly && s.hasChanges,
		hasChanges:    (s) => s.values.name !== '' && JSON.stringify(s.values) !== JSON.stringify(s.valuesOrg),
		hasLength:     (s) => ['files','richtext','text','textarea'].includes(s.usedFor),
		isId:          (s) => !s.isNew && s.values.name === 'id',
		isNew:         (s) => s.attributeId === null,
		title:         (s) => s.isNew ? s.capApp.new : s.capApp.edit.replace('{NAME}',s.values.name),
		
		// content
		isBoolean:       (s) => s.isAttributeBoolean(s.values.content),
		isFiles:         (s) => s.isAttributeFiles(s.values.content),
		isFloat:         (s) => s.isAttributeFloat(s.values.content),
		isInteger:       (s) => s.isAttributeInteger(s.values.content),
		isNumeric:       (s) => s.isAttributeNumeric(s.values.content),
		isRegconfig:     (s) => s.isAttributeRegconfig(s.values.content),
		isRelationship:  (s) => s.isAttributeRelationship(s.values.content),
		isRelationship11:(s) => s.isAttributeRelationship11(s.values.content),
		isRelationshipN1:(s) => s.isAttributeRelationshipN1(s.values.content),
		isString:        (s) => s.isAttributeString(s.values.content),
		isUuid:          (s) => s.isAttributeUuid(s.values.content),
		
		// content use
		isColor:   (s) => s.isString  && s.values.contentUse === 'color',
		isDate:    (s) => s.isInteger && s.values.contentUse === 'date',
		isDatetime:(s) => s.isInteger && s.values.contentUse === 'datetime',
		isNumber:  (s) => s.isInteger && s.values.contentUse === 'default',
		isRichtext:(s) => s.isString  && s.values.contentUse === 'richtext',
		isText:    (s) => s.isString  && s.values.contentUse === 'default',
		isTextarea:(s) => s.isString  && s.values.contentUse === 'textarea',
		isTime:    (s) => s.isInteger && s.values.contentUse === 'time',
		
		// stores
		modules:       (s) => s.$store.getters['schema/modules'],
		moduleIdMap:   (s) => s.$store.getters['schema/moduleIdMap'],
		attributeIdMap:(s) => s.$store.getters['schema/attributeIdMap'],
		capApp:        (s) => s.$store.getters.captions.builder.attribute,
		capGen:        (s) => s.$store.getters.captions.generic,
		module:        (s) => s.moduleIdMap[s.relation.moduleId]
	},
	mounted() {
		this.reset();
		window.addEventListener('keydown',this.handleHotkeys);
	},
	unmounted() {
		window.removeEventListener('keydown',this.handleHotkeys);
	},
	methods:{
		// external
		copyValueDialog,
		getAttributeIcon,
		getDependentModules,
		isAttributeBoolean,
		isAttributeFiles,
		isAttributeFloat,
		isAttributeInteger,
		isAttributeNumeric,
		isAttributeRegconfig,
		isAttributeRelationship,
		isAttributeRelationship11,
		isAttributeRelationshipN1,
		isAttributeString,
		isAttributeUuid,
		
		// actions
		handleHotkeys(e) {
			if(e.ctrlKey && e.key === 's' && this.canSave) {
				this.set();
				e.preventDefault();
			}
			if(e.key === 'Escape') {
				this.$emit('close');
				e.preventDefault();
			}
		},
		reset() {
			this.values = this.attributeId !== null
				? JSON.parse(JSON.stringify(this.attributeIdMap[this.attributeId]))
				: {
					id:null,
					moduleId:this.relation.moduleId,
					relationId:this.relation.id,
					relationshipId:null,
					iconId:null,
					content:'text',
					contentUse:'default',
					length:0,
					name:'',
					nullable:true,
					encrypted:false,
					def:'',
					onUpdate:'NO ACTION',
					onDelete:'NO ACTION',
					captions:{
						attributeTitle:{}
					}
				};
			
			this.valuesOrg = JSON.parse(JSON.stringify(this.values));
			
			// set defaults option
			switch(this.values.def) {
				case 'EXTRACT(EPOCH FROM CURRENT_DATE)': this.defaultsOption = 'date';     break;
				case 'EXTRACT(EPOCH FROM NOW())':        this.defaultsOption = 'datetime'; break;
				case 'GEN_RANDOM_UUID()':                this.defaultsOption = 'uuid';     break;
			}
		},
		updateDefaultsOption() {
			switch(this.defaultsOption) {
				case 'date':     this.values.def = 'EXTRACT(EPOCH FROM CURRENT_DATE)'; break;
				case 'datetime': this.values.def = 'EXTRACT(EPOCH FROM NOW())';        break;
				case 'uuid':     this.values.def = 'GEN_RANDOM_UUID()';                break;
			}
		},
		updateLength() {
			if(!this.isString)
				return;
			
			if(this.values.length === '')
				this.values.length = 0;
			
			this.values.content = this.values.length === 0 ? 'text' : 'varchar';
		},
		
		// backend calls
		delAsk() {
			this.$store.commit('dialog',{
				captionBody:this.capApp.dialog.delete,
				buttons:[{
					cancel:true,
					caption:this.capGen.button.delete,
					exec:this.del,
					image:'delete.png'
				},{
					caption:this.capGen.button.cancel,
					image:'cancel.png'
				}]
			});
		},
		del() {
			ws.send('attribute','del',{id:this.attributeId},true).then(
				() => {
					this.$root.schemaReload(this.module.id);
					this.$emit('close');
				},
				this.$root.genericError
			);
		},
		set() {
			if(this.values.encrypted && !this.canEncrypt)
				this.values.encrypted = false;
			
			ws.sendMultiple([
				ws.prepare('attribute','set',this.values),
				ws.prepare('schema','check',{ moduleId:this.module.id })
			],true).then(
				() => {
					this.$root.schemaReload(this.module.id);
					this.$emit('close');
				},
				this.$root.genericError
			);
		}
	}
};